-- Supabase Database Schema for Student Typing Platform MVP

-- 1. Users Profile Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'user',
    subscription_plan TEXT DEFAULT 'none',
    subscription_status TEXT DEFAULT 'inactive',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Allow update for owners and admins"
    ON public.users FOR UPDATE
    USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );


-- 2. Lessons Table for Typing Practice
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('English', 'Hindi')),
    level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    type TEXT CHECK (type IN ('theory', 'practical')) DEFAULT 'practical',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for lessons"
    ON public.lessons FOR SELECT
    USING (true);

CREATE POLICY "Allow staff and admin to manage lessons"
    ON public.lessons FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'principal', 'staff')));


-- 3. Typing Results Table
CREATE TABLE IF NOT EXISTS public.typing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    wpm DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    mistakes INTEGER NOT NULL,
    total_typed INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for typing results
ALTER TABLE public.typing_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own typing results"
    ON public.typing_results FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin to select all typing results"
    ON public.typing_results FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Allow staff and admin to manage typing results"
    ON public.typing_results FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'principal', 'staff')));
-- 4. Student Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    high_score_wpm DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for progress
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own progress"
    ON public.progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin and staff to select progress"
    ON public.progress FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'principal', 'staff'))
    );

CREATE POLICY "Allow staff and admin to manage progress"
    ON public.progress FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'principal', 'staff')));


-- 5. Automate user profile creation on Supabase Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();




-- 7. System Errors Table for Admin Monitoring
CREATE TABLE IF NOT EXISTS public.system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    pathname TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for system errors
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert system errors (to prevent blocking client logging)
CREATE POLICY "Allow anyone to insert system errors"
    ON public.system_errors FOR INSERT 
    WITH CHECK (true);

-- Allow admin to read all system errors
CREATE POLICY "Allow admin to select all system errors"
    ON public.system_errors FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- =========================================================================
-- 8. Performance Optimization Indexes for Production Scaling (50k - 80k+ Users)
-- =========================================================================

-- Index user_id in typing_results to optimize history loading on dashboards (eliminates sequential scans)
CREATE INDEX IF NOT EXISTS idx_typing_results_user_id ON public.typing_results(user_id);

-- Index created_at in typing_results to speed up chronological sorting of user scores
CREATE INDEX IF NOT EXISTS idx_typing_results_created_at ON public.typing_results(created_at DESC);



-- Index created_at in system_errors for faster dashboard loading of admin system analytics
CREATE INDEX IF NOT EXISTS idx_system_errors_created_at ON public.system_errors(created_at DESC);


-- =========================================================================
-- MULTI-TENANT SCHOOLS & INSTITUTES EXTENSION
-- =========================================================================

-- 1. Organizations Table (Schools & Institutes)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('school', 'institute')),
    logo_url TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for registered organizations"
    ON public.organizations FOR SELECT
    USING (true);

CREATE POLICY "Allow admin to manage organizations"
    ON public.organizations FOR ALL
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 2. Modify public.users Table to support organization linking and expanded roles
-- Note: In a live migration we would run an ALTER TABLE statement.
-- We are adding the columns as nullable to maintain backwards compatibility.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Drop old role check constraint if it exists and add new role check
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'user', 'principal', 'staff', 'student'));

-- 3. Classes and Batches Table
CREATE TABLE IF NOT EXISTS public.classes_or_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for classes_or_batches
ALTER TABLE public.classes_or_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for organization members"
    ON public.classes_or_batches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (role = 'admin' OR organization_id = classes_or_batches.organization_id)
        )
    );

CREATE POLICY "Allow principal and staff to manage classes"
    ON public.classes_or_batches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND organization_id = classes_or_batches.organization_id 
            AND role IN ('principal', 'staff')
        )
    );

-- 4. Class Students Table (Relationship between classes and student users)
CREATE TABLE IF NOT EXISTS public.class_students (
    class_id UUID REFERENCES public.classes_or_batches(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (class_id, student_id)
);

-- Enable RLS for class_students
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for class members and org staff"
    ON public.class_students FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.classes_or_batches c ON c.organization_id = u.organization_id
            WHERE u.id = auth.uid()
            AND (
                u.role = 'admin' 
                OR u.id = student_id 
                OR (u.organization_id = c.organization_id AND u.role IN ('principal', 'staff'))
            )
        )
    );

CREATE POLICY "Allow organization principal and staff to manage student enrollments"
    ON public.class_students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.classes_or_batches c ON c.id = class_id
            WHERE u.id = auth.uid()
            AND u.organization_id = c.organization_id
            AND u.role IN ('principal', 'staff')
        )
    );

-- 5. Assignments Table (Homework/Tests assigned to a class/batch)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes_or_batches(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    target_wpm DOUBLE PRECISION NOT NULL DEFAULT 0,
    target_accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
    due_date TIMESTAMPTZ,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for students enrolled in the class and org staff"
    ON public.assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.classes_or_batches c ON c.id = assignments.class_id
            WHERE u.id = auth.uid()
            AND (
                u.role = 'admin'
                OR (u.organization_id = c.organization_id AND u.role IN ('principal', 'staff'))
                OR EXISTS (
                    SELECT 1 FROM public.class_students cs 
                    WHERE cs.class_id = assignments.class_id AND cs.student_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Allow staff to manage assignments for their organization"
    ON public.assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.classes_or_batches c ON c.id = class_id
            WHERE u.id = auth.uid()
            AND u.organization_id = c.organization_id
            AND u.role IN ('principal', 'staff')
        )
    );

-- 6. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    typing_result_id UUID REFERENCES public.typing_results(id) ON DELETE SET NULL,
    wpm DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    mistakes INTEGER NOT NULL,
    total_typed INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for assignment_submissions
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow students to manage their own submissions"
    ON public.assignment_submissions FOR ALL
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow organization staff to view submissions"
    ON public.assignment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.assignments a ON a.id = assignment_id
            JOIN public.classes_or_batches c ON c.id = a.class_id
            WHERE u.id = auth.uid()
            AND u.organization_id = c.organization_id
            AND u.role IN ('principal', 'staff', 'admin')
        )
    );

-- 7. Certificates Table (Verifiable certificates)
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    wpm DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    certified_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_code TEXT UNIQUE NOT NULL
);

-- Enable RLS for certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for typing certificates verification"
    ON public.certificates FOR SELECT
    USING (true);

CREATE POLICY "Allow org staff to issue certificates"
    ON public.certificates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
            AND u.organization_id = certificates.organization_id
            AND u.role IN ('principal', 'staff', 'admin')
        )
    );

-- =========================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_classes_org_id ON public.classes_or_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(certificate_code);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON public.progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_typing_results_lesson_id ON public.typing_results(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson_id ON public.assignments(lesson_id);


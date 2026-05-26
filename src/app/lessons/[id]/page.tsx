import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import TypingEngine from '@/components/ClientTypingEngine';

interface Lesson {
  id: string;
  title: string;
  content: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'English' | 'Hindi';
}

const FALLBACK_LESSONS: Lesson[] = [
  {
    id: 'en-home-row',
    title: 'Home Row Practice',
    content: 'asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;',
    level: 'Beginner',
    language: 'English',
  },
  {
    id: 'en-top-row',
    title: 'Top Row Practice',
    content: 'qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy qwert poiuy',
    level: 'Beginner',
    language: 'English',
  },
  {
    id: 'en-bottom-row',
    title: 'Bottom Row Practice',
    content: 'zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn zxcvb /.,mn',
    level: 'Beginner',
    language: 'English',
  },
  {
    id: 'en-fox',
    title: 'Quick Brown Fox',
    content: 'the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog',
    level: 'Intermediate',
    language: 'English',
  },
  {
    id: 'en-paragraph',
    title: 'Simple Paragraph',
    content: 'typing practice is very important to build typing speed and accuracy. focus on correct finger placement on the home row keys. do not look at the keyboard. typing regularly will build muscle memory.',
    level: 'Intermediate',
    language: 'English',
  },
  {
    id: 'en-tech',
    title: 'Technological Era',
    content: 'the advancement of artificial intelligence and machine learning is reshaping the technological landscape. software engineering practices are evolving rapidly, requiring continuous adaptation and robust system design skills from developers worldwide.',
    level: 'Advanced',
    language: 'English',
  },
  {
    id: 'en-time',
    title: 'Philosophy of Time',
    content: 'time is a created thing. to say I do not have time, is like saying, I do not want to. our focus should be on prioritizing high impact creative actions rather than running behind minor distractions in our daily lives.',
    level: 'Advanced',
    language: 'English',
  },
  {
    id: 'hi-home-row',
    title: 'Hindi Home Row',
    content: 'd s f g ] a \' k l Z d s f g ] a \' k l Z d s f g ] a \' k l Z d s f g ] a \' k l Z d s f g ] a \' k l Z d s f g ] a \' k l Z',
    level: 'Beginner',
    language: 'Hindi',
  },
  {
    id: 'hi-top-row',
    title: 'Hindi Top Row',
    content: 'w e r t y u i o p [ w e r t y u i o p [ w e r t y u i o p [ w e r t y u i o p [ w e r t y u i o p [ w e r t y u i o p [',
    level: 'Beginner',
    language: 'Hindi',
  },
  {
    id: 'hi-bottom-row',
    title: 'Hindi Bottom Row',
    content: 'z x c v b n m , . / z x c v b n m , . / z x c v b n m , . / z x c v b n m , . / z x c v b n m , . / z x c v b n m , . /',
    level: 'Beginner',
    language: 'Hindi',
  },
  {
    id: 'hi-simple',
    title: 'Hindi Simple Words',
    content: 'jke jktk jke dk jktk Fkk mldh jkuh Fkh nksuksa taxy x;s Fks ogk¡ mUgksaus ,d \'ksj ns[kk jke us rhj pyk;k jktk cgqr [kq\'k gqvk taxy dk n`\'; cgqr gh lqUnj Fkk A',
    level: 'Intermediate',
    language: 'Hindi',
  },
  {
    id: 'hi-sentence',
    title: 'Hindi Sentence Practice',
    content: 'lPpk fe= ogh gS tks foifRr ds le; dke vk;s A gesa ges\'kk nwljksa dh enn djuh pkfg, A tSlh djuh oSlh Hkjuh A tks tSlk cks;sxk og oSlk gh dkVsxk A le; cgqr gh ewY;oku gS bls O;FkZ u [kks;sa A',
    level: 'Intermediate',
    language: 'Hindi',
  },
  {
    id: 'hi-advanced',
    title: 'Hindi Advanced Paragraph',
    content: 'O;fDrxr fodkl ds fy, fujUrj vH;kl dh vko\';drk gksrh gS A tc ge vius y{; ds izfr lefiZr gksrs gSa rks lQyrk fuf\'pr gh feyrh gS A ifjJe gh lQyrk dh dqatkh gS A thou esa fujUrj vkxs c<+rs jguk gh ixzsfr dk nwljk uke gS A gesa vius drZO;ksa dk fu"Bk ls ikyu djuk pkfg, A',
    level: 'Advanced',
    language: 'Hindi',
  },
];

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  
  let lesson: Lesson | null = null;
  
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      lesson = data as Lesson;
    }
  } catch (err) {
    console.error('Error fetching lesson:', err);
  }

  // Fallback check
  if (!lesson) {
    lesson = FALLBACK_LESSONS.find((l) => l.id === id) || null;
  }

  if (!lesson) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Lesson Not Found</h2>
        <p className="text-slate-400 text-sm">
          The requested lesson does not exist or has been removed.
        </p>
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-white/10 px-5 py-3 text-sm font-bold text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
      </div>
    );
  }

  // Calculate lesson index dynamically matching list page
  let lessonNumber = 1;
  let nextLessonId: string | null = null;

  const isFallbackId = id.startsWith('en-') || id.startsWith('hi-');

  if (isFallbackId) {
    const filtered = FALLBACK_LESSONS.filter(
      (l) => l.language === lesson!.language && l.level === lesson!.level
    );
    const index = filtered.findIndex((l) => l.id === id);
    if (index !== -1) {
      lessonNumber = index + 1;
      if (index + 1 < filtered.length) {
        nextLessonId = filtered[index + 1].id;
      }
    }
  } else {
    try {
      const { data: dbLessons } = await supabase
        .from('lessons')
        .select('id, language, level')
        .order('created_at', { ascending: true });

      const lessonsList = (dbLessons && dbLessons.length > 0) ? dbLessons : FALLBACK_LESSONS;
      const filtered = lessonsList.filter(
        (l) => l.language === lesson!.language && l.level === lesson!.level
      );
      const index = filtered.findIndex((l) => l.id === id);
      if (index !== -1) {
        lessonNumber = index + 1;
        if (index + 1 < filtered.length) {
          nextLessonId = filtered[index + 1].id;
        }
      }
    } catch (err) {
      console.error('Error calculating lesson number:', err);
      const filtered = FALLBACK_LESSONS.filter(
        (l) => l.language === lesson!.language && l.level === lesson!.level
      );
      const index = filtered.findIndex((l) => l.id === id);
      if (index !== -1) {
        lessonNumber = index + 1;
        if (index + 1 < filtered.length) {
          nextLessonId = filtered[index + 1].id;
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-10 w-full space-y-5 sm:space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4.5">
        <div className="flex items-center gap-2">
          <Link
            href="/lessons"
            className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-md bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer hover:border-white/10 shrink-0"
            title="Back to Lessons"
          >
            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Lesson {lessonNumber} - {lesson.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="rounded bg-slate-900 border border-white/5 px-2.5 py-1 text-xs font-bold text-slate-400">
            {lesson.language === 'Hindi' ? 'Krutidev Layout' : 'English QWERTY'}
          </span>
        </div>
      </div>

      {/* Mounting live Typing test Playground */}
      <div className="w-full">
        <TypingEngine
          lessonId={lesson.id}
          nextLessonId={nextLessonId}
          initialText={lesson.content}
          language={lesson.language}
        />
      </div>
    </div>
  );
}

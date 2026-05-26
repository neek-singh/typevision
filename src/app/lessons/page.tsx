'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/utils/supabase';
import LessonHeader from '@/components/lessons/lesson-header';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { Lesson, ProgressItem } from '@/components/lessons/lesson-card';
import { fetchWithCache } from '@/lib/cache/cache-utils';

const LessonProgress = dynamic(() => import('@/components/lessons/lesson-progress'), {
  ssr: false,
  loading: () => <Skeleton className="h-28 w-full rounded-2xl animate-pulse" />
});

const LessonList = dynamic(() => import('@/components/lessons/lesson-list'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
});

// Fallback seed lessons in case database is empty or not yet connected
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

export default function Lessons() {
  const { user, initialize } = useAuthStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, ProgressItem>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const loadLessonsData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Lessons (ordered by creation date ascending) and User Progress in parallel
        const lessonsPromise = supabase
          .from('lessons')
          .select('*')
          .order('created_at', { ascending: true });

        const progressPromise = user
          ? fetchWithCache(`progress-${user.id}`, async () => {
              const { data, error } = await supabase
                .from('progress')
                .select('*')
                .eq('user_id', user.id);
              if (error) throw error;
              return data || [];
            }, 15000)
          : Promise.resolve([]);

        const [lessonsRes, userProgress] = await Promise.all([
          lessonsPromise,
          progressPromise
        ]);

        if (lessonsRes.error) throw lessonsRes.error;
        const dbLessons = lessonsRes.data || [];

        if (dbLessons && dbLessons.length > 0) {
          setLessons(dbLessons as Lesson[]);
        } else {
          setLessons(FALLBACK_LESSONS);
        }

        if (userProgress) {
          const progMap: Record<string, ProgressItem> = {};
          userProgress.forEach((p) => {
            progMap[p.lesson_id] = {
              lesson_id: p.lesson_id,
              completed: p.completed ?? true,
              accuracy: p.accuracy ?? 0,
              best_wpm: p.best_wpm ?? p.high_score_wpm ?? 0,
              high_score_wpm: p.high_score_wpm ?? p.best_wpm ?? 0,
            };
          });
          setProgress(progMap);
        }
      } catch (err) {
        console.error('Failed to load lessons:', err);
        setLessons(FALLBACK_LESSONS);
      } finally {
        setLoading(false);
      }
    };

    loadLessonsData();
  }, [user]);

  if (loading && lessons.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400 font-semibold">Loading lessons...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Title Header */}
      <LessonHeader
        title="Typing Lessons"
        subtitle="Select standard practice modules mapped by level and language layout."
      />

      {/* Progress tracking - only show if authenticated */}
      {user && (
        <LessonProgress
          totalLessons={lessons.length}
          progressMap={progress}
        />
      )}

      {/* Filterable Lessons List */}
      <LessonList
        lessons={lessons}
        progressMap={progress}
      />
    </div>
  );
}

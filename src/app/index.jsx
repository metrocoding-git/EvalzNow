'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

/* ============================================================================
   EvalzNow — single-page landing (Next.js component)
   Brand: maroon + navy, modernized from the original infographic-style page.
   All copy below is sourced from the client's existing EVZ marketing pages.
   ============================================================================ */

/* -------------------------------------------------------------------------- */
/*  Icons (inline SVG — no external icon package required)                    */
/* -------------------------------------------------------------------------- */

const IconCheck = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconArrow = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
        <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconChevron = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconMenu = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
);
const IconX = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
);
const IconTarget = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
);
const IconActivity = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M3 12h4l2.5-7L14 19l2.5-7H21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconBrain = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8V15a3 3 0 0 0 3 3h1M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.8V15a3 3 0 0 1-3 3h-1M9 4v15M15 4v15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGauge = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M4 14a8 8 0 1 1 16 0" strokeLinecap="round" />
        <path d="M12 14 16 9" strokeLinecap="round" />
        <path d="M12 18h.01" strokeLinecap="round" />
    </svg>
);
const IconBriefcase = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCap = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="m2 9 10-5 10 5-10 5-10-5Z" strokeLinejoin="round" />
        <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 9v6" strokeLinecap="round" />
    </svg>
);
const IconMail = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconMapPin = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
const IconSparkle = (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
        <path d="M12 2c.6 3.8 2.4 5.6 6.2 6.2-3.8.6-5.6 2.4-6.2 6.2-.6-3.8-2.4-5.6-6.2-6.2C9.6 7.6 11.4 5.8 12 2Z" />
        <path d="M19.5 15c.3 1.9 1.2 2.8 3.1 3.1-1.9.3-2.8 1.2-3.1 3.1-.3-1.9-1.2-2.8-3.1-3.1 1.9-.3 2.8-1.2 3.1-3.1Z" />
    </svg>
);
const IconMonitor = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
    </svg>
);
const IconHeadset = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" strokeLinecap="round" />
        <rect x="2.5" y="13" width="5" height="7" rx="2" />
        <rect x="16.5" y="13" width="5" height="7" rx="2" />
        <path d="M19.5 20v.5a3 3 0 0 1-3 3h-3" strokeLinecap="round" />
    </svg>
);
const IconClipboard = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
);
const IconUsers = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
        <path d="M16 4.3a3 3 0 0 1 0 5.8M22 20c0-2.7-2-5-5-5.8" strokeLinecap="round" />
    </svg>
);
const IconEye = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const IconDatabase = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" strokeLinecap="round" />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" strokeLinecap="round" />
    </svg>
);
const IconListOrdered = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M10 6h11M10 12h11M10 18h11" strokeLinecap="round" />
        <path d="M4 6h1v3M4 6l1-1M4 15h2l-2 2.5h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCpu = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" strokeLinecap="round" />
    </svg>
);
const IconSigma = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <path d="M18 5H6l6 7-6 7h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGlobe = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" strokeLinecap="round" />
    </svg>
);
const IconQuote = (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
        <path d="M9 7c-3 0-5 2.2-5 5.4 0 2.8 1.9 4.6 4.3 4.6.4 2.4-1.2 4-3.8 4.3v2.2c4.4-.3 7-3 7-7.4C11.5 12.4 9.9 7 9 7Zm10 0c-3 0-5 2.2-5 5.4 0 2.8 1.9 4.6 4.3 4.6.4 2.4-1.2 4-3.8 4.3v2.2c4.4-.3 7-3 7-7.4C21.5 12.4 19.9 7 19 7Z" />
    </svg>
);

/* -------------------------------------------------------------------------- */
/*  Motion presets                                                            */
/* -------------------------------------------------------------------------- */

const fadeUp = {
    hidden: { opacity: 0, y: 34 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
    }),
};

const wordUp = {
    hidden: { opacity: 0, y: 24, rotateX: -40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
    }),
};

const HERO_WORDS = ['Why', 'Choose'];

/* -------------------------------------------------------------------------- */
/*  Content (sourced from the existing EvalzNow marketing pages)              */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
    { label: 'Overview', href: '#overview' },
    { label: 'Insights', href: '#insights' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Pricing', href: '#pricing' },
];

const MATRIX_BARS = [46, 72, 58, 85, 63, 94, 70, 52];

const CORE_PILLARS = [
    { icon: IconTarget, title: 'Competency Accounting', desc: 'Measuring, processing, and communicating quantitative and qualitative performance data.' },
    { icon: IconActivity, title: 'Performance Monitoring', desc: 'Live tracking of knowledge capacity across people, programs, and institutions.' },
    { icon: IconBrain, title: 'Cognitive Psychology', desc: 'Grounded in how people actually learn, adapt, and grow competency over time.' },
    { icon: IconGauge, title: 'Advanced Evaluation', desc: 'A large measurable-variable matrix built to track knowledge capacity precisely.' },
];

const BUILDING_BLOCKS = [
    { n: '01', title: 'Educational Psychology', icon: IconBrain },
    { n: '02', title: 'Competency Accounting', icon: IconTarget },
    { n: '03', title: 'Complex Mathematical Modeling', icon: IconSigma },
];

const SOLUTION_PROCESS = [
    { n: '01', title: 'Pre-Processing of Data', icon: IconDatabase },
    { n: '02', title: 'Submission for Analysis', icon: IconActivity },
    { n: '03', title: 'Post-Processing of Data', icon: IconCpu },
];

const CORPORATE_BENEFITS = [
    'Provide complete oversight of knowledge capacity to execs, government, and regulators.',
    'Provide live updates of employee performance for constructive feedback.',
    'Eliminate performance review paperwork, easing HR workloads.',
    'Identify underperforming & overperforming employees.',
    'Replace systems driven by personality tests, appraisals, and interpersonal relationships.',
    'Track the productivity rates and the utilization rates of employees.',
    'Serve as a resolution vehicle when investigating company disputes.',
    'Reveal the need for training or training improvements/effectiveness.',
    'Support the upward mobility process as well as promotions, bonuses, and/or speed-tracking.',
    'Maintain a comprehensive record of employment activities across an unlimited period.',
    'Track the conditions (program status + time impact) associated with a task.',
    'Support advanced psychometrics, NLP, R&D efforts, and intelligence training.',
    'Support any KPI that is a function of knowledge capacity and human competence.',
    'Accept data from learning management systems (LMS) and machine learning (ML) software.',
];

const EDUCATION_BENEFITS = [
    'Collaborate with professional colleagues to support learning objectives.',
    'Set complex pass/fail thresholds that incorporate both, proficiency and growth.',
    'Overhaul educational policy on grading and assessment.',
    'Track socioeconomics as a function of competency.',
    'Design effective lessons to teach a larger range of students.',
    'Respond to learning difficulties in a timely, yet objective, way.',
    'Hold students and instructors accountable throughout the learning process.',
    'Conduct comparative analyses at the student/class/institutional level.',
    'Determine how students can be reasonably challenged.',
    'Determine how students can be scaffolded individually.',
    'Track student engagement in the classroom.',
    'Maintain a comprehensive record of student knowledge across any period.',
    'Report student progress to administrators and parents for feedback.',
    'Reflect on current practice to determine if the needs of students are being met.',
    'Modify and refine teaching approaches alongside quantitative observations.',
    'Make growth projections based on evidence.',
    'Reach calculated growth targets based on individual performance.',
    'Rank/Index educational entities based on student-centered results.',
    'Map benchmarks and performance points to trace out Needs Assessment paths.',
    'Associate brain area indicators to performance for neuroscience studies.',
    'Identify overperforming and underperforming students.',
];

const SECTORS = [
    'Aerospace & Defense', 'Airlines Aviation', 'Alternative Medicine', 'Automotive', 'Banking',
    'Biotechnology', 'Broadcast Media', 'Business Development', 'Business Sustainment', 'Capital Markets',
    'Construction', 'Consumer Services', 'Education', 'Energy', 'Engineering', 'Entertainment',
    'Financial Services', 'Governmental Relations', 'Governmental Ministries', 'Health & Wellness',
    'Healthcare', 'Hospitality', 'Human Resources', 'Immigration', 'Individual & Family Services',
    'Information Services', 'Insurance', 'International Affairs', 'Investment Firms', 'Law Enforcement',
    'Legal & Judiciary', 'Logistics & Supply Chain', 'Manufacturing', 'Mental Health Services',
    'Military & Operations', 'Oil & Gas', 'Pharmaceuticals', 'Politics & Diplomacy', 'Professional Sports',
    'Project Management', 'Public Policy', 'Public Relations', 'Real Estate', 'Research & Higher Learning',
    'Restaurant', 'Talent Acquisition & Recruiting', 'Telecommunications', 'Tourism', 'Training Centers',
    'Utilities', 'Venture Capital & Private Equity', 'Vocation & Skilled Laborers',
];

const SUPPORT_SERVICES = [
    { label: 'Training (Virtual/Onsite)', icon: IconMonitor },
    { label: '24/7 Technical Support', icon: IconHeadset },
    { label: 'Competency Support', icon: IconTarget },
    { label: 'Rubric Generation', icon: IconClipboard },
    { label: 'Dedicated Management', icon: IconUsers },
    { label: 'Oversight Assistance', icon: IconEye },
    { label: 'Data Auditing', icon: IconDatabase },
    { label: 'Indexing & Ranking', icon: IconListOrdered },
];

const PRICING_TIERS = [
    { n: 1, name: 'Micro Size', range: '1–4 Candidates', price: 70 },
    { n: 2, name: 'Small Size', range: '5–19 Candidates', price: 65 },
    { n: 3, name: 'Medium Size', range: '20–99 Candidates', price: 60 },
    { n: 4, name: 'Large Size', range: '100–249 Candidates', price: 55 },
    { n: 5, name: 'Low Enterprise', range: '250–999 Candidates', price: 50 },
    { n: 6, name: 'High Enterprise', range: '1,000–2,499 Candidates', price: 45 },
    { n: 7, name: 'Small Campus', range: '2,500–4,999 Candidates', price: 40 },
    { n: 8, name: 'Medium Campus', range: '5,000–14,999 Candidates', price: 35 },
    { n: 9, name: 'Large Campus', range: '15,000–50,000 Candidates', price: 30 },
    { n: 10, name: 'Mega Campus', range: '> 50,000 Candidates', price: 25 },
];

const FAQS = [
    { q: 'Question #1?', a: 'One particular challenge for schools and educators is the changing nature of student learning constructs over time.' },
    { q: 'Question #2?', a: 'One particular challenge for schools and educators is the changing nature of student learning constructs over time.' },
    { q: 'Question #3?', a: 'One particular challenge for schools and educators is the changing nature of student learning constructs over time.' },
    { q: 'Question #4?', a: 'One particular challenge for schools and educators is the changing nature of student learning constructs over time.' },
];

/* -------------------------------------------------------------------------- */
/*  Small reusable pieces                                                     */
/* -------------------------------------------------------------------------- */

function Eyebrow({ children, dark }) {
    return (
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? 'text-rose-300' : 'text-[#8c1d32]'}`}>
            {children}
        </p>
    );
}

function ButtonPrimary({ children, href = '#contact' }) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7a1229] to-[#9c1a35] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#7a1229]/20 transition-shadow hover:shadow-xl hover:shadow-[#7a1229]/30"
        >
            {children}
            <IconArrow className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </motion.a>
    );
}

function ButtonSecondary({ children, href = '#contact' }) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#131a3d]/15 bg-white px-6 py-3 text-sm font-medium text-[#131a3d] transition-colors hover:bg-[#131a3d]/5"
        >
            {children}
        </motion.a>
    );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function EvalzNowLanding() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const [activeTab, setActiveTab] = useState('corporate');
    const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '', notRobot: false });
    const [submitted, setSubmitted] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    const { scrollYProgress } = useScroll();
    const progressWidth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const blobY1 = useTransform(heroProgress, [0, 1], [0, 120]);
    const blobY2 = useTransform(heroProgress, [0, 1], [0, -80]);

    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);
    const rotateX = useSpring(useTransform(tiltY, [-40, 40], [8, -8]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(tiltX, [-40, 40], [-8, 8]), { stiffness: 200, damping: 20 });

    const handleCardMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        tiltX.set(e.clientX - rect.left - rect.width / 2);
        tiltY.set(e.clientY - rect.top - rect.height / 2);
    };
    const handleCardMouseLeave = () => {
        tiltX.set(0);
        tiltY.set(0);
    };

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 700);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Scroll-spy: highlight the nav link for whichever section is currently in view
    useEffect(() => {
        const sectionIds = NAV_LINKS.map((l) => l.href.slice(1));
        const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.notRobot) return;
        setSubmitted(true);
    };

    return (
        <div className="relative min-h-screen bg-white text-[#1b1f2e] antialiased">
            <style jsx global>{`
        html { scroll-behavior: smooth; }
        section[id] { scroll-margin-top: 76px; }
        @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes blob { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(5%,-6%) scale(1.08); } 66% { transform: translate(-5%,5%) scale(0.94); } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.25; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.15) rotate(15deg); } }
        .animate-float { animation: floatY 6s ease-in-out infinite; }
        .animate-blob { animation: blob 22s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-twinkle { animation: twinkle 3.5s ease-in-out infinite; }
        .brand-gradient { background: linear-gradient(120deg, #7a1229, #131a3d); }
        .brand-text-gradient { background: linear-gradient(120deg, #9c1a35, #1c2652); -webkit-background-clip: text; background-clip: text; color: transparent; }
      `}</style>

            {/* Scroll progress bar */}
            <motion.div
                aria-hidden
                className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left brand-gradient"
                style={{ scaleX: progressWidth }}
            />

            {/* Back to top */}
            <AnimatePresence>
                {showTop && (
                    <motion.a
                        href="#overview"
                        initial={{ opacity: 0, scale: 0.6, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: 20 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full brand-gradient text-white shadow-lg shadow-[#7a1229]/30"
                        aria-label="Back to top"
                    >
                        <IconArrow className="h-4 w-4 -rotate-90" />
                    </motion.a>
                )}
            </AnimatePresence>

            {/* ---------------------------------------------------------------- */}
            {/* Navbar                                                           */}
            {/* ---------------------------------------------------------------- */}
            <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl">
                <div className="h-1 w-full brand-gradient" />
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <a href="#overview" className="flex items-center gap-2 text-2xl font-black tracking-tight">
                        <span className="brand-text-gradient">EVZ</span>
                    </a>

                    <nav className="hidden items-center gap-7 lg:flex">
                        {NAV_LINKS.map((l) => {
                            const isActive = activeSection === l.href.slice(1);
                            return (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    aria-current={isActive ? 'true' : undefined}
                                    className={`group relative text-sm font-medium transition ${isActive ? 'text-[#7a1229]' : 'text-[#1b1f2e]/70 hover:text-[#7a1229]'
                                        }`}
                                >
                                    {l.label}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full brand-gradient transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                            }`}
                                    />
                                </a>
                            );
                        })}


                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="flex items-center gap-2">
                            <a href="#" aria-label="Medium" className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-xs font-bold text-[#1b1f2e]/60 transition hover:border-[#7a1229]/40 hover:text-[#7a1229]">M</a>
                            <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-xs font-bold text-[#1b1f2e]/60 transition hover:border-[#7a1229]/40 hover:text-[#7a1229]">in</a>
                        </div>
                        <a href="/login" className="rounded-full brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:opacity-90">
                            Login
                        </a>

                    </div>

                    <button aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)} className="rounded-lg border border-black/10 p-2 text-[#1b1f2e]/80 lg:hidden">
                        {menuOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
                    </button>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-black/5 lg:hidden"
                        >
                            <div className="flex flex-col gap-1 px-6 py-4">
                                {[...NAV_LINKS].map((l) => {
                                    const isActive = activeSection === l.href.slice(1);
                                    return (
                                        <a
                                            key={l.label}
                                            href={l.href}
                                            onClick={() => setMenuOpen(false)}
                                            className={`rounded-lg px-2 py-2.5 text-sm transition ${isActive ? 'bg-[#7a1229]/5 font-semibold text-[#7a1229]' : 'text-[#1b1f2e]/80 hover:bg-black/5'
                                                }`}
                                        >
                                            {l.label}
                                        </a>
                                    );
                                })}
                                <a href="/login" onClick={() => setMenuOpen(false)} className="mt-2 rounded-full brand-gradient px-4 py-2.5 text-center text-sm font-medium text-white">
                                    Login
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* ---------------------------------------------------------------- */}
            {/* Hero / Overview                                                  */}
            {/* ---------------------------------------------------------------- */}
            <section id="overview" ref={heroRef} className="relative overflow-hidden px-6 pb-10 pt-20 md:pb-18 md:pt-24">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                    <motion.div style={{ y: blobY1 }} className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#9c1a35]/10 blur-[110px] animate-blob" />
                    <motion.div style={{ y: blobY2 }} className="absolute top-10 -right-32 h-96 w-96 rounded-full bg-[#1c2652]/10 blur-[110px] animate-blob" />

                    {/* Floating sparkle accents */}
                    <IconSparkle className="absolute left-[12%] top-[18%] h-5 w-5 text-[#9c1a35]/50 animate-twinkle" />
                    <IconSparkle className="absolute right-[15%] top-[28%] h-4 w-4 text-[#1c2652]/50 animate-twinkle" style={{ animationDelay: '-1.2s' }} />
                    <IconSparkle className="absolute left-[22%] bottom-[18%] h-3.5 w-3.5 text-[#7a1229]/40 animate-twinkle" style={{ animationDelay: '-2.1s' }} />
                    <IconSparkle className="absolute right-[10%] bottom-[24%] h-5 w-5 text-[#1c2652]/40 animate-twinkle" style={{ animationDelay: '-0.6s' }} />
                </div>

                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mx-auto max-w-3xl text-center">
                    <Eyebrow>The Novel Solution to Human Capital Assessment</Eyebrow>
                    <h1 className="mt-4 flex flex-wrap items-center justify-center gap-x-3 text-4xl font-bold tracking-tight [perspective:800px] sm:text-5xl">
                        {HERO_WORDS.map((w, i) => (
                            <motion.span key={w} initial="hidden" animate="visible" variants={wordUp} custom={i} className="inline-block">
                                {w}
                            </motion.span>
                        ))}
                        <motion.span initial="hidden" animate="visible" variants={wordUp} custom={2} className="brand-text-gradient inline-block">
                            EvalzNow?
                        </motion.span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#1b1f2e]/65">
                        EvalzNow provides detailed, human capital assessments using a new innovative approach known
                        as Competency Accounting. As the approach suggests, Competency Accounting is the measurement,
                        the processing, and the communication of quantitative and qualitative information regarding
                        any performance-based entity — students, employees, AI humanoids, educational facilities,
                        businesses, defense agencies, and so forth. The foundation of the Competency Accounting
                        approach centers on grouping measurable variables into a large matrix to track knowledge
                        capacity.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <ButtonPrimary href="#contact">Learn More</ButtonPrimary>
                        <ButtonSecondary href="#contact">Contact Sales</ButtonSecondary>
                    </div>
                </motion.div>

                {/* Core pillars */}
                <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
                    {CORE_PILLARS.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.4 }}
                            variants={fadeUp}
                            custom={i}
                            whileHover={{ y: -5 }}
                            className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm shadow-black/5"
                        >
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7a1229]/10 to-[#1c2652]/10 text-[#7a1229]">
                                <f.icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#1b1f2e]/55">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tilting analytics mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ rotateX, rotateY, transformPerspective: 1000 }}
                    className="animate-float relative mx-auto mt-16 max-w-4xl rounded-2xl border border-black/5 bg-white p-2 shadow-2xl shadow-[#7a1229]/10"
                >
                    <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#7a1229]/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                        <span className="ml-3 text-xs text-[#1b1f2e]/40">app.evalznow.com/matrix</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-black/5 bg-[#faf7f6] p-4 sm:col-span-2">
                            <p className="flex items-center gap-1.5 text-xs text-[#1b1f2e]/45">
                                <IconActivity className="h-3.5 w-3.5" /> Knowledge capacity matrix
                            </p>
                            <div className="mt-4 flex h-32 items-end gap-2">
                                {MATRIX_BARS.map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.7, delay: 0.4 + i * 0.06, ease: 'easeOut' }}
                                        className="flex-1 rounded-t-md bg-gradient-to-t from-[#7a1229] to-[#9c1a35]"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col justify-between gap-3">
                            <div className="rounded-xl border border-black/5 bg-[#faf7f6] p-4">
                                <p className="flex items-center gap-1.5 text-xs text-[#1b1f2e]/45"><IconTarget className="h-3.5 w-3.5" /> Competency score</p>
                                <p className="mt-1 text-2xl font-semibold brand-text-gradient">92.4</p>
                            </div>
                            <div className="rounded-xl border border-black/5 bg-[#faf7f6] p-4">
                                <p className="flex items-center gap-1.5 text-xs text-[#1b1f2e]/45"><IconGauge className="h-3.5 w-3.5" /> Growth trend</p>
                                <p className="mt-1 text-2xl font-semibold text-emerald-500">+18%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Work / Edu split                                                 */}
            {/* ---------------------------------------------------------------- */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeUp}
                        custom={0}
                        className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-[#1c2652] to-[#0d1230] p-8 text-white"
                    >
                        <motion.div
                            aria-hidden
                            animate={{ rotate: [0, 8, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            className="pointer-events-none absolute -right-8 -top-8 text-white/[0.06]"
                        >
                            <IconBriefcase className="h-48 w-48" />
                        </motion.div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                            <IconBriefcase className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-2xl font-semibold">Work</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/65">
                            A resource-management tool that assesses and tracks human competency across your
                            workforce — sustaining leadership, revenue, and long-term organizational resilience.
                        </p>
                        <ul className="mt-6 space-y-2.5">
                            {['Competency Accounting', 'Performance Monitoring', 'Cognitive Psychology', 'Advanced Evaluation'].map((t) => (
                                <li key={t} className="flex items-center gap-2 text-sm text-white/80">
                                    <IconArrow className="h-3.5 w-3.5 shrink-0 text-rose-300" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeUp}
                        custom={1}
                        className="relative overflow-hidden rounded-3xl border border-black/5 p-8"
                        style={{ background: 'linear-gradient(135deg, #7a1229, #9c1a35)' }}
                    >
                        <motion.div
                            aria-hidden
                            animate={{ rotate: [0, -8, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            className="pointer-events-none absolute -right-8 -top-8 text-white/[0.08]"
                        >
                            <IconCap className="h-48 w-48" />
                        </motion.div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
                            <IconCap className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-2xl font-semibold text-white">Education</h3>
                        <p className="mt-3 text-sm leading-relaxed text-white/75">
                            A stand-alone solution that absorbs assessments from any teaching methodology, giving
                            educators evidence-based ways to reach their learning objectives.
                        </p>
                        <ul className="mt-6 space-y-2.5">
                            {['Proficiency & Growth Tracking', 'Comparative Institution Analysis', 'Needs Assessment Mapping', 'Student Engagement Tracking'].map((t) => (
                                <li key={t} className="flex items-center gap-2 text-sm text-white/85">
                                    <IconArrow className="h-3.5 w-3.5 shrink-0 text-white" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Unlimited Portfolios banner                                      */}
            {/* ---------------------------------------------------------------- */}
            <section className="overflow-hidden border-y border-black/5 brand-gradient py-6">
                <div className="flex whitespace-nowrap">
                    <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <span key={i} className="text-2xl font-black uppercase tracking-widest text-white/90 sm:text-3xl">
                                Unlimited Portfolios
                            </span>
                        ))}
                    </div>
                    <div aria-hidden className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <span key={i} className="text-2xl font-black uppercase tracking-widest text-white/90 sm:text-3xl">
                                Unlimited Portfolios
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* "How can anyone deny EvalzNow" + building blocks / process       */}
            {/* ---------------------------------------------------------------- */}
            <section className="mx-auto max-w-5xl px-6 py-20 text-center">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white mb-2">
                        <IconQuote className="h-5 w-5" />
                    </div>
                    <Eyebrow>The Problem</Eyebrow>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">How Can Anyone Deny EvalzNow?</h2>
                    <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[#1b1f2e]/65">
                        For decades, educational experts and governmental representatives have intensely debated
                        whether proficiency or growth should be the driver for evaluating student learning, ranking
                        schools, funding schools, and so forth. For even longer, corporates have struggled to find
                        systems that comprehensively assess and track the knowledge competencies of their
                        workforces, leading to the adoption of personality tests, appraisal systems, and annual
                        employee performance reviews — a lot of unnecessary paperwork and useless efforts!
                    </p>
                </motion.div>

                <div className="mt-16 grid grid-cols-1 gap-10 text-left md:grid-cols-2">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} custom={0}>
                        <h3 className="text-lg font-semibold text-[#7a1229]">EvalzNow Building Blocks</h3>
                        <div className="mt-5 space-y-4">
                            {BUILDING_BLOCKS.map((b, i) => (
                                <motion.div
                                    key={b.n}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm shadow-black/5"
                                >
                                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-gradient text-white">
                                        <b.icon className="h-4 w-4" />
                                        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white px-1 text-[9px] font-bold text-[#7a1229] shadow">{b.n}</span>
                                    </span>
                                    <span className="text-sm font-medium">{b.title}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} custom={1}>
                        <h3 className="text-lg font-semibold text-[#1c2652]">EvalzNow Solution Process</h3>
                        <div className="mt-5 space-y-4">
                            {SOLUTION_PROCESS.map((b) => (
                                <motion.div
                                    key={b.n}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-sm shadow-black/5"
                                >
                                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1c2652] to-[#0d1230] text-white">
                                        <b.icon className="h-4 w-4" />
                                        <span className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white px-1 text-[9px] font-bold text-[#1c2652] shadow">{b.n}</span>
                                    </span>
                                    <span className="text-sm font-medium">{b.title}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.p
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={fadeUp}
                    className="relative mx-auto mt-14 max-w-2xl rounded-2xl border border-black/5 bg-[#faf7f6] p-6 pt-9 text-sm font-medium italic text-[#1b1f2e]/70"
                >
                    <IconQuote className="absolute left-5 top-4 h-6 w-6 text-[#7a1229]/25" />
                    "EvalzNow is a stand-alone solution that does not require integration or maturation periods.
                    Even the interface was designed to be extremely user-friendly."
                </motion.p>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Insights: how EvalzNow solves problems (tabbed)                  */}
            {/* ---------------------------------------------------------------- */}
            <section id="insights" className="bg-[#faf7f6] px-6 py-20">
                <div className="mx-auto max-w-6xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="mx-auto max-w-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white mb-2">
                            <IconActivity className="h-5 w-5" />
                        </div>
                        <Eyebrow>Insights</Eyebrow>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">How Can EvalzNow Solve Your Problems?</h2>
                    </motion.div>

                    <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} custom={0} className="text-sm leading-relaxed text-[#1b1f2e]/65">
                            One particular challenge for schools and educators is the changing nature of student
                            learning constructs over time. Research has shown that students can neither be evaluated
                            with imprecise longitudinal models nor fixed proficiency criteria, because students adapt
                            holistically to new academic challenges — assuming that students learn the same is
                            categorically false. After working with a disruptive software solution like EvalzNow,
                            which can absorb all assessments from any teaching methodology, educators will discover
                            that there are several ways to utilize the results to reach their objectives!
                        </motion.p>
                        <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} custom={1} className="text-sm leading-relaxed text-[#1b1f2e]/65">
                            Corporate and defense companies are constantly searching for innovative, resource
                            management tools to assess and to track human competency. Such tools are responsible not
                            only for sustaining a work-related eco-system that encourages top-of-the-line leadership,
                            increased revenue, and success, but also for developing a resilient educational base,
                            preparing for local/global markets, and channeling lifelong career opportunities for
                            employees. In essence, these companies want either to find globally competitive
                            individuals or to groom their employees into them. This is where EvalzNow becomes handy!
                        </motion.p>
                    </div>

                    {/* Tabs */}
                    <div className="mx-auto mt-14 flex w-fit rounded-full border border-black/10 bg-white p-1 shadow-sm">
                        {[
                            { id: 'corporate', label: 'For Business' },
                            { id: 'education', label: 'For Education' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`relative rounded-full px-6 py-2 text-sm font-medium transition ${activeTab === t.id ? 'text-white' : 'text-[#1b1f2e]/60 hover:text-[#1b1f2e]'
                                    }`}
                            >
                                {activeTab === t.id && (
                                    <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full brand-gradient" transition={{ type: 'spring', duration: 0.5 }} />
                                )}
                                <span className="relative">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                            className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
                        >
                            {(activeTab === 'corporate' ? CORPORATE_BENEFITS : EDUCATION_BENEFITS).map((item) => (
                                <div key={item} className="flex items-start gap-2.5 rounded-lg bg-white/60 p-2.5 text-sm text-[#1b1f2e]/70">
                                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#7a1229]" />
                                    {item}
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Sectors                                                          */}
            {/* ---------------------------------------------------------------- */}
            <section className="mx-auto max-w-6xl px-6 py-20">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="mx-auto max-w-2xl text-center">
                    <motion.div
                        aria-hidden
                        animate={{ rotate: 360 }}
                        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white mb-2"
                    >
                        <IconGlobe className="h-5 w-5" />
                    </motion.div>
                    <Eyebrow>Who We Serve</Eyebrow>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Every Sector, One Assessment Engine</h2>
                    <p className="mt-4 text-sm leading-relaxed text-[#1b1f2e]/60">
                        Our assessment power is limitless and we offer what others simply cannot deliver — we cater
                        to more sectors than anyone on the global market, including but not limited to:
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-2.5"
                >
                    {SECTORS.map((s) => (
                        <span
                            key={s}
                            className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-[#1b1f2e]/70 transition hover:border-[#7a1229]/30 hover:text-[#7a1229] hover:motion-safe:animate-pulse"
                        >
                            {s}
                        </span>
                    ))}
                </motion.div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* FAQ                                                              */}
            {/* ---------------------------------------------------------------- */}
            <section id="faq" className="bg-[#faf7f6] px-6 py-20">
                <div className="mx-auto max-w-4xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="mx-auto max-w-2xl text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white mb-2">
                            <IconChevron className="h-5 w-5" />
                        </div>
                        <Eyebrow>FAQ</Eyebrow>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {FAQS.map((f, i) => {
                            const open = openFaq === i;
                            return (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.3 }}
                                    variants={fadeUp}
                                    custom={i}
                                    className="overflow-hidden rounded-xl border border-black/5 bg-white"
                                >
                                    <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                                        <span className="flex items-center gap-3 text-sm font-medium">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full brand-gradient text-[11px] font-bold text-white">
                                                {i + 1}
                                            </span>
                                            {f.q}
                                        </span>
                                        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                            <IconChevron className="h-4 w-4 shrink-0 text-[#1b1f2e]/40" />
                                        </motion.span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                                <p className="px-5 pb-4 pl-15 text-sm leading-relaxed text-[#1b1f2e]/60">{f.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="mt-10 flex justify-center gap-3">
                        <ButtonPrimary href="/">Login</ButtonPrimary>

                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------------------- */}
            {/* Pricing                                                          */}
            {/* ---------------------------------------------------------------- */}
            <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={fadeUp} className="mx-auto max-w-2xl text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-white mb-2">
                        <IconGauge className="h-5 w-5" />
                    </div>
                    <Eyebrow>Pricing</Eyebrow>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Monthly Tier Pricing Per Candidate</h2>
                </motion.div>

                <div className="mt-12 grid grid-cols-4 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {PRICING_TIERS.map((t, i) => (
                        <motion.div
                            key={t.n}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                            custom={i % 5}
                            whileHover={{ y: -5 }}
                            className="flex flex-col items-center rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm shadow-black/5"
                        >
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1b1f2e]/40">Tier {t.n}</span>
                            <span className="mt-1 text-sm font-semibold text-[#1c2652]">{t.name}</span>
                            <span className="mt-1 text-[11px] text-[#1b1f2e]/50">{t.range}</span>
                            <span className="mt-3 brand-text-gradient text-2xl font-bold">${t.price}</span>
                            <span className="text-[10px] text-[#1b1f2e]/40">/candidate/mo</span>
                        </motion.div>
                    ))}
                </div>
                <p className="mx-auto mt-6 max-w-xl text-center text-xs text-[#1b1f2e]/45">
                    * All subscribers are charged an annual cost at the max candidate count of the tier.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                    <ButtonPrimary href="/">Login</ButtonPrimary>
                </div>
            </section>


            {/* ---------------------------------------------------------------- */}
            {/* Footer                                                           */}
            {/* ---------------------------------------------------------------- */}
            <footer className="bg-[#0d1230] px-6 py-12 text-white">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
                    <span className="text-2xl font-black tracking-tight">EVZ</span>
                    <div className="flex flex-col items-center gap-1.5 text-sm text-white/60">
                        <span className="flex items-center gap-1.5"><IconMapPin className="h-4 w-4" /> The Rick Butler Education EST Dubai — United Arab Emirates</span>
                        <span className="flex items-center gap-1.5"><IconMail className="h-4 w-4" /> evalznow@trbei.com</span>
                    </div>
                    <nav className="flex flex-wrap items-center justify-center gap-6">
                        {NAV_LINKS.map((l) => (
                            <a key={l.href} href={l.href} className="text-xs text-white/50 transition hover:text-white">
                                {l.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <a href="#" aria-label="Medium" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs font-bold text-white/60 transition hover:border-white/40 hover:text-white">M</a>
                        <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs font-bold text-white/60 transition hover:border-white/40 hover:text-white">in</a>
                    </div>
                    <p className="text-xs text-white/35">COPYRIGHT © {new Date().getFullYear()} EVALZNOW | ALL RIGHTS RESERVED</p>
                </div>
            </footer>
        </div>
    );
}
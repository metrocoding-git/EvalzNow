'use client';
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';



const LOGO = "/Assets/images/logo.png"

const BANNER_OVERVIEW = "/Assets/images/bannerTwoRespNew.png"
const BANNER_INSIGHTS = "/Assets/images/bannerThreeResp.jpg";
const BANNER_REGISTRATION = "/Assets/images/bannerOneRespNew.png";
const ARROW_ICON = "/Assets/images/arrowIcon.png";
const STAR_ICON = "/Assets/images/starIcon.png";
const EMAIL_ICON = "/Assets/images/emailIcon.png";
const LINKEDIN_ICON = "/Assets/images/linkdinIcon.png";
const POINT_ONE = "/Assets/images/pointOne.png";
const POINT_TWO = "/Assets/images/pointTwo.png";
const POINT_THREE = "/Assets/images/pointThree.png";
const POINT_FOUR = "/Assets/images/pointFour.png";
const POINT_FIVE = "/Assets/images/pointFive.png";
const POINT_SIX = "/Assets/images/pointSix.png";

const MONTHLY_ONE = "/Assets/images/monthlyPointOne.png";
const MONTHLY_TWO = "/Assets/images/monthlyPointTwo.png";
const MONTHLY_THREE = "/Assets/images/monthlyPointThree.png";
const MONTHLY_FOUR = "/Assets/images/monthlyPointFour.png";
const MONTHLY_FIVE = "/Assets/images/monthlyPointFive.png";
const MONTHLY_SIX = "/Assets/images/monthlyPointSix.png";
const MONTHLY_SEVEN = "/Assets/images/monthlyPointSeven.png";
const MONTHLY_EIGHT = "/Assets/images/monthlyPointEight.png";
const MONTHLY_NINE = "/Assets/images/monthlyPointNine.png";
const MONTHLY_TEN = "/Assets/images/monthlyPointTen.png";



const SECTORS = [
    ["Aerospace & Defense", "Airlines Aviation", "Alternative Medicine", "Automotive", "Banking", "Biotechnology", "Broadcast Media", "Business Development", "Business Sustainment", "Capital Markets", "Construction", "Consumer Services", "Education"],
    ["Energy", "Engineering", "Entertainment", "Financial Services", "Governmental Relations", "Governmental Ministries", "Health & Wellness", "Healthcare", "Hospitality", "Human Resources", "Immigration", "Individual & Family Services", "Information Services"],
    ["Insurance", "International Affairs", "Investment Firms", "Law Enforcement", "Legal & Judiciary", "Logistics & Supply Chain", "Manufacturing", "Mental Health Services", "Military & Operations", "Oil & Gas", "Pharmaceuticals", "Politics & Diplomacy", "Professional Sports"],
    ["Project Management", "Public Policy", "Public Relations", "Real Estate", "Research & Higher Learning", "Restaurant", "Talent Acquisition & Recruiting", "Telecommunications", "Tourism", "Training Centers", "Utilities", "Venture Capital & Private Equity", "Vocation & Skilled Laborers"],
];

const CORPORATE_BENEFITS = [
    'Provide complete oversight of knowledge capacity to execs, government, and regulators.',
    'Provide live updates of employee performance for constructive feedback.',
    'Eliminate performance review paperwork, easing HR workloads.',
    'Identify underperforming & overperforming employees.',
    'Replace systems driven by personality tests, appraisals, and interpersonal relationships.',
    'Track the productivity rates and the utilization rates of employees.',
    'Serve as a resolution vehicle when investigating company disputes.',
    'Reveal the need for training or training improvements & effectiveness.',
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

const IconCheck = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
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

const IconArrow = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" {...p}>
        <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CORE_PILLARS = [
    { icon: IconTarget, title: 'Competency Accounting', desc: 'Measuring, processing, and communicating quantitative and qualitative performance data.' },
    { icon: IconActivity, title: 'Performance Monitoring', desc: 'Live tracking of knowledge capacity across people, programs, and institutions.' },
    { icon: IconBrain, title: 'Cognitive Psychology', desc: 'Grounded in how people actually learn, adapt, and grow competency over time.' },
    { icon: IconGauge, title: 'Advanced Evaluation', desc: 'A large measurable-variable matrix built to track knowledge capacity precisely.' },
];
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


const NAV_LINKS = [
    { label: 'OVERVIEW', href: '#overview' },
    { label: 'INSIGHTS', href: '#insights' },
    { label: 'LOGIN', href: '/login' },

];

const PONTS = [
    { p: "Training (Virtual/Onsite)" },
    { p: "24/7 Technical Support" },
    { p: "Competency Support" },
    { p: "Rubric Generation" },
    { p: "Dedicated Assistance" },
    { p: "Oversight Assistance" },
    { p: "Data Auditing" },
    { p: "Indexing & Ranking" },

];

const STYLES = `
  :root{
    --navy:#111640;
    --navy-dark:#0b0f2e;
    --maroon:#621101;
    --maroon-dark:#62180f;
    --card:#f7f7f7;
    --font: Calibri, "Segoe UI", Candara, Optima, "Helvetica Neue", Arial, sans-serif;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  .evz-root{
    margin:0;
    font-family:var(--font);
    color:#1a1a1a;
    -webkit-font-smoothing:antialiased;
}
  .evz-root img{max-width:100%;display:block;}
  .evz-root .wrap{margin:0 auto;padding:0 20px;}
  .wrapMaxWidth{max-width:900px;}

  /* ---------- NAV ---------- */
  .evz-root .navbar{
    position:sticky;top:0;z-index:1000;
    display:flex;align-items:stretch;
    background:linear-gradient(to right, #ffffff 0%, #ffffff 12%, var(--navy-dark) 12%, var(--navy-dark) 55%, var(--maroon) 55%, var(--maroon) 100%);
    box-shadow:0 2px 10px rgba(0,0,0,.25);
  }
.evz-root .brand{
    position:relative;
    display:flex;align-items:center;justify-content:center;
    padding:2px 80px 2px 20px;background:#fff;flex:0 0 auto;
    clip-path: polygon(0 0, 100% 0, calc(100% - 45px) 100%, 0 100%);
}
.evz-root .brand img{height:85px;width:auto;}

.evz-root .brand::after{
    content:"";
    position:absolute;
    top:0;
    right:-34px;
    width:14px;
    height:100%;
    background:#fff;
    transform:skewX(-20deg);
}
  .evz-root .links{
    flex:1 1 auto;
    display:flex;align-items:center;justify-content:flex-end;
    gap:22px;padding:0 22px;
  }
  .evz-root .links a{
    color:#fff;text-decoration:none;font-weight:700;font-size:15px;
    white-space:nowrap;opacity:.95;cursor:pointer;
  }
  .evz-root .links a:hover{opacity:1;text-decoration:underline;}
  .evz-root .login-btn{
    background:#fff;color:var(--maroon-dark)!important;
    border-radius:20px;padding:9px 24px!important;font-weight:800!important;
    text-decoration:none!important;box-shadow:0 2px 6px rgba(0,0,0,.3);
  }
  .evz-root .nav-toggle{display:none;background:none;border:none;color:#fff;font-size:28px;padding:6px 16px;cursor:pointer;}

  @media (max-width:900px){
    .evz-root .navbar{flex-wrap:wrap;}
    .evz-root .nav-toggle{display:block;order:2;margin-left:auto;}
    .evz-root .brand{flex:0 0 auto;}
    .evz-root .links{
      order:3;flex-basis:100%;
      display:none;flex-direction:column;align-items:flex-start;
      gap:14px;padding:16px 22px 22px;
    }
    .evz-root .links.open{display:flex;}
  }

  /* ---------- GENERIC ---------- */
  .evz-root .section{padding:20px 0 20px;}

  .insightsSection{margin:50px 0 50px;}
  .evz-root .title-lg{
    color:var(--navy);font-weight:800;text-align:center;
    font-size:clamp(20px,3.2vw,32px);letter-spacing:.5px;margin:0 0 22px;
  }
  .evz-root .title-md{
    color:var(--maroon-dark);font-weight:800;text-align:center;
    font-size:clamp(22px,3.6vw,34px);margin:0 0 18px;
  }
  .evz-root .divider{
    width:44%;min-width:220px;max-width:520px;
    height:5px;background:#111;opacity:.75;margin:26px auto;border:none;
  }
  .evz-root .lead{
    margin:0 auto;
    font-weight:700;font-size:clamp(14px,1.6vw,19px);line-height:1.6;color:#161616;
  }
    .leadMain {
        padding: 15px;
        background-color: #ffffff;
        // border-radius: 25px;
    }
  .evz-root .card{
    background:var(--card);border-radius:16px;padding:26px;
    font-weight:700;text-align:center;font-size:clamp(14px,1.5vw,18px);line-height:1.6;
  }
  .evz-root .btn-row{display:flex;flex-wrap:wrap;gap:18px;justify-content:center;margin:34px 0;}
  .evz-root .btn{
    background-image:linear-gradient(to right,var(--navy) 10%,var(--maroon) 40%);
    color:#fff;border:none;border-radius:20px;
    font-family:var(--font);font-weight:700;font-size:15px;
    padding:14px 30px;min-width:150px;cursor:pointer;
    box-shadow:0 4px 10px rgba(0,0,0,.25);
  }
  .evz-root .btn:hover{filter:brightness(1.08);}

  .evz-root .feature-list{max-width:620px;margin:34px auto 10px;display:flex;flex-direction:column;gap:16px;}
  .evz-root .feature-item{display:flex;align-items:center;gap:16px;justify-content:center;}
  .evz-root .feature-item img{width:30px;height:auto;flex:0 0 auto;}
  .evz-root .feature-item span{color:var(--navy);font-weight:800;font-size:clamp(16px,2.4vw,26px);letter-spacing:.5px;}

  .evz-root .two-col{display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:1100px;margin:40px auto 0;align-items:start;}
  .evz-root .two-col h3{color:var(--maroon);text-align:center;font-weight:800;font-size:clamp(18px,2.4vw,26px);margin:0 0 18px;}
  .evz-root .point-stack{display:flex;flex-direction:column;gap:14px;}
  @media (max-width:760px){ .evz-root .two-col{grid-template-columns:1fr;gap:44px;} }

  .evz-root .price-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;max-width:1100px;margin:0 auto;}
  .evz-root .price-stack{display:flex;flex-direction:column;gap:14px;}
  @media (max-width:760px){ .evz-root .price-grid{grid-template-columns:1fr;} }
  .evz-root .fine-print{max-width:700px;margin:18px auto 0;font-weight:700;font-size:13px;text-align:center;}

  .evz-root .two-card{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1100px;margin:0 auto;}
  @media (max-width:760px){ .evz-root .two-card{grid-template-columns:1fr;} }

  .evz-root .pint-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-width:800px;margin:50px auto 50px;}
@media (max-width:700px){ .evz-root .pint-grid{grid-template-columns:repeat(2, minmax(200px, max-content));} }
  .evz-root .point-item{display:flex;gap:14px;align-items:flex-start;}
  .evz-root .point-item img{width:32px;margin-top:4px;flex:0 0 auto;}
  .evz-root .point-item h4{margin:0 0 6px;color:var(--maroon-dark);font-weight:800;font-size:clamp(18px,2.2vw,24px);}
  .evz-root .point-item p{margin:0;font-size:14px;line-height:1.5;color:#333;}

  .evz-root .sector-box{background:#f7f7f7;border-radius:20px;padding:26px;max-width:1500px;margin:30px auto 0;}
  .evz-root .sector-grid{
    display:grid;
    grid-template-columns:repeat(4, minmax(200px, max-content));
    justify-content:center;
    gap:6px 40px;
  }
  @media (max-width:900px){
    .evz-root .sector-grid{grid-template-columns:repeat(2, minmax(200px, max-content));}
  }
//   @media (max-width:520px){
//     .evz-root .sector-grid{grid-template-columns:1fr;justify-content:stretch;}
//   }

  @media (max-width: 520px) {
    .evz-root .sector-grid {
        grid-template-columns: repeat(1, minmax(200px, max-content));
    }
}

  .evz-root .sector-grid p{margin:6px 0;font-weight:700;font-size:15px;}

  .evz-root .form-box{max-width:520px;margin:20px auto 0;background:#f0f0f0;border-radius:20px;padding:28px;}
  .evz-root .form-field{margin-bottom:18px;}
  .evz-root .form-field label{display:block;font-weight:800;font-size:15px;margin-bottom:8px;}
  .evz-root .form-field input, .evz-root .form-field textarea{
    width:100%;border:1px solid #ccc;border-radius:8px;padding:10px 12px;
    font-family:var(--font);font-size:14px;background:#fff;
  }
  .evz-root .form-field textarea{min-height:110px;resize:vertical;}
  .evz-root .captcha-fake{
    display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #d3d3d3;
    border-radius:6px;padding:12px 14px;font-size:13px;color:#555;max-width:260px;
  }
  .evz-root .captcha-fake input{width:18px;height:18px;}
  .evz-root .form-submit-row{display:flex;justify-content:flex-end;margin-top:18px;}

//   .evz-root footer{background:var(--navy);color:#fff;padding:40px 20px 26px;}
  .evz-root footer{color:#fff;padding:30px;}
    .evz-root .footer-inner{max-width:900px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:30px;text-align:center;}

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .footer-brand img {
    width: clamp(100px, 12vw, 450px);
    height: auto;
    object-fit: contain;
    object-fit: contain;
  }

  .footer-brand span {
    font-size: clamp(28px, 8vw, 100px);
    font-weight: 1000;
    color: #ffffff;
    margin-left: 10px;
    line-height: 1;
  }

  .evz-root .footer-text p{margin:4px 0;font-weight:700;font-size:16px;}
  .evz-root .footer-copy{margin-top:10px;font-size:12px;opacity:.85;font-weight:400;}
  .evz-root .footer-socials{display:flex;gap:16px;}
  .evz-root .footer-socials img{width:44px;height:44px;cursor:pointer;}

  @media (max-width:600px){
    .evz-root .footer-inner{flex-direction:column;gap:16px;}
    .footer-brand span{font-size:32px;}
    .footer-brand img{width:56px;}
  }


  .evz-root .footer-text p{margin:4px 0;font-weight:700;font-size:16px;}
  .evz-root .footer-copy{margin-top:10px;font-size:12px;opacity:.85;font-weight:400;}
  .evz-root .footer-socials{display:flex;gap:16px;}
  .evz-root .footer-socials img{width:44px;height:44px;cursor:pointer;}

  .evz-root .banner-img{width:100%;display:block;}
  .evz-root section[id]{scroll-margin-top:90px;}
`;

export default function EvalzNowPage() {
    const [navOpen, setNavOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('corporate');

    const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });

    const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const { scrollYProgress } = useScroll();
    const [showTop, setShowTop] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    const progressWidth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name) return alert("Required : Name");
        if (!form.email) return alert("Required : Email");
        if (!form.company) return alert("Required : Company");
        if (!form.phone) return alert("Required : Phone");
        if (!form.message) return alert("Required : Message");
        alert("Form Submitted Successfully");
        setForm({ name: "", email: "", company: "", phone: "", message: "" });
    };

    useEffect(() => {
        const sectionIds = NAV_LINKS.map((l) => l.href.slice(1));
        const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);


        const handleTopScroll = () => {
            if (window.scrollY < 150) {
                setActiveSection('overview');
            }
        };
        window.addEventListener('scroll', handleTopScroll, { passive: true });
        handleTopScroll();

        if (!sections.length) {
            return () => window.removeEventListener('scroll', handleTopScroll);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));
        return () => {
            window.removeEventListener('scroll', handleTopScroll);
            observer.disconnect();
        };
    }, []);

    // Drives the "back to top" button's entrance/exit animation.
    useEffect(() => {
        const handleScroll = () => {
            setShowTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeNav = () => setNavOpen(false);

    return (
        <div className=" evz-root relative min-h-screen bg-white text-[#1b1f2e] antialiased">
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
                .brand-light-gradient { background: linear-gradient(120deg, #fff4f6, #4457b65c); }
        .brand-text-gradient { background: linear-gradient(120deg, #9c1a35, #1c2652); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .bg-gradient {     background: linear-gradient(273deg, #621101, #15163d); }

      `}</style>

            <style>{STYLES}</style>
            {/* <motion.div
                aria-hidden
                className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left brand-gradient"
                style={{ scaleX: progressWidth }}
            /> */}

            {/* Back to top */}
            <AnimatePresence>
                {showTop && (
                    <motion.a
                        href="#"
                        initial={{ opacity: 0, scale: 0.6, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: 20 }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg shadow-[#7a1229]/30"
                        aria-label="Back to top"
                    >
                        <IconArrow className="h-4 w-4 -rotate-90" />
                    </motion.a>
                )}
            </AnimatePresence>

            {/* ================= NAV ================= */}
            <motion.header
                initial={{ y: -90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="sticky top-0 z-50 border-black/5 bg-gradient backdrop-blur-xl"
            >
                {/* <div className="h-1 w-full brand-gradient"> </div> */}
                <div className="mx-auto flex items-center justify-between pr-6 ">
                    <motion.a
                        href="/"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex brand items-center gap-2 tracking-tight "
                        onClick={closeNav}
                    >
                        {/* <span className="brand-text-gradient">EVZ</span> */}
                        <img src={LOGO} alt="EVZ logo" />

                    </motion.a>
                    <div className="lg:flex items-center gap-4 hidden">
                        <nav className="hidden items-center gap-7 lg:flex">
                            {NAV_LINKS.map((l) => {
                                const isActive = activeSection === l.href.slice(1);
                                return (
                                    <a
                                        key={l.href}
                                        href={l.href}
                                        aria-current={isActive ? 'true' : undefined}
                                        className={`group relative text-lg font-bold transition ${isActive ? 'text-[#e9d9d9]' : 'text-[#ffffff] hover:text-[#e9d9d9]'
                                            }`}
                                    >
                                        {l.label}
                                        <span
                                            className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left rounded-full brand-light-gradient transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                                }`}
                                        />
                                    </a>
                                );
                            })}


                        </nav>

                    </div>




                    <button aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)} className="rounded-lg border border-white p-2 text-[#ffff] lg:hidden">
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
                                            className={`rounded-lg px-2 py-2.5 text-lg font-bold transition ${isActive ? 'text-[#e9d9d9] transition bg-[#7a1229]' : 'text-[#ffffff] hover:text-[#e9d9d9]'
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
            </motion.header>

            {/* ================= OVERVIEW ================= */}
            <motion.div
                className="wrap section"
                initial="hidden"
                animate="visible"
                custom={0}
                variants={fadeUp}
            >
                <motion.p variants={fadeUp} custom={0} className="title-lg">THE NOVEL SOLUTION TO HUMAN CAPITAL ASSESSMENT</motion.p>
                <hr className="divider" />

                <motion.h2 variants={fadeUp} custom={1} className="title-md">Why Choose EvalzNow?</motion.h2>
                <motion.div variants={fadeUp} custom={2} className="leadMain">
                    <p className="lead text-justify wrapMaxWidth">
                        EvalzNow provides detailed, human capital assessments using a new innovative approach known as
                        Competency Accounting. As the approach suggests, Competency Accounting is the measurement, the
                        processing, and the communication of quantitative information and qualitative information regarding
                        any performance-based entity such as students, employees AI humanoids, educational facilities,
                        businesses, defense agencies, and so forth. The foundation of the Competency Accounting approach
                        centers on grouping measurable variables into a large matrix to track knowledge capacity.
                    </p>
                </motion.div>

                <hr className="divider" />
            </motion.div>


            <motion.img
                className="banner-img"
                src={BANNER_OVERVIEW}
                alt="Work and Education competency accounting graphic"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />


            <div className="wrap">
                <hr className="divider" />
            </div>

            <section id="overview" >
                <motion.h2
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={fadeUp}
                    className="title-md"
                >
                    How Can Anyone Deny EvalzNow?
                </motion.h2>
                <motion.div variants={fadeUp} custom={2} className="leadMain">
                    <p className="lead text-justify wrapMaxWidth">
                        For decades, educational experts and governmental representatives have intensely debated whether
                        proficiency or growth should be the driver for evaluating student learning, ranking schools, funding
                        schools, and so forth. For even longer, corporates have struggled to find systems that comprehensively
                        assess and track the knowledge competencies of their workforces, leading to the adoption of
                        personality tests, appraisal systems, and annual employee performance reviews &ndash; a lot of
                        unnecessary paperwork and useless efforts!
                    </p>
                </motion.div>



                <hr className="divider" />

                <motion.img
                    className="banner-img mt-10"
                    src={BANNER_REGISTRATION}
                    alt="EvalzNow training and support graphic"
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />


            </section>



            {/* ================= INSIGHTS ================= */}
            <section id="insights" >
                <motion.p
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={fadeUp}
                    className="title-lg pt-10"
                >
                    MANAGING KNOWLEDGE CAPACITY IN EDUCATION AND INDUSTRY
                </motion.p>
                <hr className="divider" />
                <motion.h2
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={fadeUp}
                    custom={1}
                    className="title-md"
                >
                    How Can EvalzNow Solve Your Problems?
                </motion.h2>

                <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">


                </div>

                {/* Tabs */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.6 }}
                    variants={fadeUp}
                    custom={2}
                    className="mx-auto flex w-fit rounded-full border border-black/10 bg-white p-1 shadow-sm"
                >
                    {[
                        { id: 'corporate', label: 'For Industry' },
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
                </motion.div>
                <AnimatePresence mode="wait">
                    <div className="mt-10 grid grid-cols-1 gap-8 lead text-justify">

                        {activeTab === 'corporate' ? (
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={fadeUp}
                                custom={0}
                                className="text-lg leading-relaxed mt-10 leadMain"
                            >
                                <p className="lead text-justify wrapMaxWidth">

                                    Corporate and defense companies are constantly searching for innovative
                                    resource management tools to assess and to track human competency. Such
                                    tools are responsible not only for sustaining a work-related eco-system
                                    that encourages top-of-the-line leadership, increased revenue, and success,
                                    but also for developing a resilient educational base, preparing for
                                    local/global markets, and channeling lifelong career opportunities for
                                    employees. In essence, these companies want either to find globally
                                    competitive individuals or to groom their employees into them. This is where
                                    EvalzNow becomes handy!
                                </p>

                            </motion.div>
                        ) : (
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={fadeUp}
                                custom={0}
                                className="text-lg leading-relaxed mt-10 leadMain"
                            >
                                <p className="lead text-justify wrapMaxWidth">
                                    One particular challenge for schools and educators is the changing nature
                                    of student learning constructs over time. Research has shown that students
                                    can neither be evaluated with imprecise longitudinal models nor fixed
                                    proficiency criteria, because students adapt holistically to new academic
                                    challenges — assuming that students learn the same is categorically false.
                                    After working with a disruptive software solution like EvalzNow, which can
                                    absorb all assessments from any teaching methodology, educators will
                                    discover that there are several ways to utilize the results to reach their
                                    objectives!
                                </p>

                            </motion.div>


                        )}

                    </div>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className="mx-auto mt-5 grid max-w-5xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
                    >


                        {(activeTab === 'corporate'
                            ? CORPORATE_BENEFITS
                            : EDUCATION_BENEFITS
                        ).map((item, i) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                                className="flex items-start gap-2.5 rounded-lg bg-white/60 p-1 text-md font-bold text-justify"
                            >
                                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#7a1229]" />
                                {item}
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                <hr className="divider" />

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
                        </motion.div>
                    ))}
                </div>



                <section>
                    <div className="b-2">
                        <motion.p
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.4 }}
                            variants={fadeUp}
                            className="title-lg pt-10"
                        >
                            REACH OUT TO US ANYTIME
                        </motion.p>
                        <hr className="divider" />
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={fadeUp}
                            custom={1}
                            className="text-lg leading-relaxed mt-10 leadMain"
                        >
                            <p className="lead text-center wrapMaxWidth">
                                Our assessment power is limitless and we offer what others simply cannot deliver. Not to mention,
                                we cater to more sectors than anyone on the global market including - but not limited to:
                            </p>

                        </motion.div>


                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.15 }}
                            variants={fadeUp}
                            custom={2}
                            className="sector-box"
                        >
                            <div className="sector-grid">
                                {SECTORS.map((col, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 14 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        {col.map((s, j) => (
                                            <p key={j}>&sect; {s}</p>
                                        ))}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>




                    </div>

                    <div className="wrap mb-10">
                        <div className="pint-grid">
                            {PONTS.map((item, i) => (
                                <motion.div
                                    className="point-item"
                                    key={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.5 }}
                                    variants={fadeUp}
                                    custom={i}
                                >
                                    <img src={STAR_ICON} alt="" />
                                    <div>
                                        <h4>{item.p}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>





                </section>

                {/* <img className="banner-img" src={BANNER_INSIGHTS} alt="EvalzNow work and education capability graphic" /> */}
            </section>

            {/* ================= REGISTRATION ================= */}


            {/* ================= PRICING ================= */}
            {/* <section id="pricing" className="section">
                <div className="wrap">
                    <h2 className="title-md">Monthly Tier Pricing Per Candidate</h2>
                    <div className="price-grid">
                        <div className="price-stack">
                            <img src={MONTHLY_ONE} alt="Tier 1 Micro Size USD 70" />
                            <img src={MONTHLY_TWO} alt="Tier 2 Small Size USD 65" />
                            <img src={MONTHLY_THREE} alt="Tier 3 Medium Size USD 60" />
                            <img src={MONTHLY_FOUR} alt="Tier 4 Large Size USD 55" />
                            <img src={MONTHLY_FIVE} alt="Tier 5 Low Enterprise USD 50" />
                        </div>
                        <div className="price-stack">
                            <img src={MONTHLY_SIX} alt="Tier 6 High Enterprise USD 45" />
                            <img src={MONTHLY_SEVEN} alt="Tier 7 Small Campus USD 40" />
                            <img src={MONTHLY_EIGHT} alt="Tier 8 Medium Campus USD 35" />
                            <img src={MONTHLY_NINE} alt="Tier 9 Large Campus USD 30" />
                            <img src={MONTHLY_TEN} alt="Tier 10 Medium Campus USD 25" />
                        </div>
                    </div>
                    <p className="fine-print">**All subscribers are charged an annual cost at the max candidate count of the tier</p>

                    <div className="btn-row">
                        <button className="btn">Learn More</button>
                        <button className="btn">Contact Sales</button>
                    </div>
                </div>
            </section> */}

            {/* ================= FOOTER ================= */}
            <motion.footer
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#111640]"
            >
                <div className="footer-inner">
                    <div className="footer-text">
                        <div className="footer-brand">
                            <img src="/Assets/images/logoIcon.png" alt="EvalzNow Logo" />
                            <div>
                                <span>EVALZNOW</span>
                                <p className="footer-copy">COPYRIGHT &copy; {new Date().getFullYear()} EVALZNOW | ALL RIGHTS RESERVED</p>
                                <p className="footer-copy">DEVELOPED BY <a href="https://www.metrocoding.com/" target="_blank" rel="noopener noreferrer">METROCODING</a></p>

                            </div>
                        </div>
                    </div>
                    {/* <div className="footer-socials">
                        <a href="mailto:evalznow@trbei.com"><img src={EMAIL_ICON} alt="Email" /></a>
                        <a href="#"><img src={LINKEDIN_ICON} alt="LinkedIn" /></a>
                    </div> */}
                </div>
            </motion.footer>
        </div>
    );
}
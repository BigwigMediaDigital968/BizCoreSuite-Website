'use client';

import React, { useState } from 'react';
import { Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { sceneIndexOf } from '../../context/SceneContext';
import { GradientButton } from './GradientButton';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

type NavLink = (typeof siteConfig.navLinks)[number];
const DEMO_SCENE = sceneIndexOf('final-cta');

interface NavbarProps {
  activeSceneIndex?: number;
  onSelectScene?: (index: number) => void;
  onOpenDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSceneIndex = 0,
  onSelectScene,
  onOpenDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Off the home page (e.g. /blogs) there are no scenes to scrub to: links go to
  // "/#<sceneId>" and the home page glides to that scene on load (see AppShell).
  const onHome = !!onSelectScene;
  const onBlog = pathname?.startsWith('/blogs') ?? false;

  const goToScene = (sceneId: string) => {
    setMobileMenuOpen(false);
    if (onSelectScene) onSelectScene(sceneIndexOf(sceneId));
    else router.push(sceneId === 'hero' ? '/' : `/#${sceneId}`);
  };
  const handleLinkClick = (link: NavLink) => goToScene(link.sceneId);
  const openDemo = () => {
    setMobileMenuOpen(false);
    if (onOpenDemo) onOpenDemo();
    else goToScene(siteConfig.contact.demoUrl.replace('#', '') || 'final-cta');
  };

  // Highlighted while the active scene sits inside the link's [activeFrom … activeTo] range
  const isLinkActive = (link: NavLink) =>
    onHome && activeSceneIndex >= sceneIndexOf(link.activeFrom) && activeSceneIndex <= sceneIndexOf(link.activeTo);

  return (
    <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-6 md:px-8 pt-4 md:pt-5 pointer-events-none transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => goToScene('hero')}
          aria-label="Bizcore Suite home"
          className="flex gap-1 px-4 py-2 items-baseline rounded-full glass-pill border border-white/80 shadow-card-soft group transition-transform duration-300 hover:scale-[1.02] text-left"
        >
          <Image src={"/bizcore-logo.png"} alt='bizcoresute' width={30} height={25}/>
          <Image src={"/bizcore-brandname.png"} alt='bizcoresute' width={130} height={40}/>
        </button>

        {/* Center Navigation Links (Floating Glass Pill) */}
        <nav 
          aria-label="Main Navigation" 
          className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full glass-pill border border-white/80 shadow-floatingPill"
        >
          {siteConfig.navLinks.map((link) => {
            const isActive = isLinkActive(link);
            return (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-navy-900 bg-tint-100 shadow-sm'
                    : 'text-navy-muted hover:text-navy-900 hover:bg-white/50'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
                )}
              </button>
            );
          })}
          {/* <Link
            href="/blogs"
            aria-current={onBlog ? 'page' : undefined}
            className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              onBlog ? 'text-navy-900 bg-tint-100 shadow-sm' : 'text-navy-muted hover:text-navy-900 hover:bg-white/50'
            }`}
          >
            Blog
            {onBlog && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />}
          </Link> */}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href={siteConfig.contact.loginUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full text-xs font-semibold text-navy-900 hover:text-brand-600 bg-white/70 hover:bg-white border border-tint-200/80 shadow-sm transition-all duration-200"
          >
            Sign In
          </a>

          <GradientButton
            size="sm"
            onClick={() => {
              if (onOpenDemo) onOpenDemo();
              else if (onSelectScene) onSelectScene(DEMO_SCENE);
              else openDemo();
            }}
            showArrow
          >
            Book a Demo
          </GradientButton>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2.5 rounded-full glass-pill border border-white/80 text-navy-900 shadow-sm focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-Screen Animated Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-2xl flex flex-col justify-between p-6 text-white pointer-events-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-white">Bizcore Suite</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4 my-auto py-8">
            {siteConfig.navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link)}
                className="flex items-center justify-between py-2 text-xl font-bold text-blue-100 hover:text-white transition-colors text-left"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-5 h-5 text-brand-400" />
              </button>
            ))}
            {/* <Link
              href="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-xl font-bold text-blue-100 hover:text-white transition-colors text-left"
            >
              <span>Blog</span>
              <ChevronRight className="w-5 h-5 text-brand-400" />
            </Link> */}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
            <a
              href={siteConfig.contact.loginUrl}
              className="w-full py-3.5 rounded-full text-center font-bold text-sm bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Client Sign In
            </a>
            <GradientButton
              size="lg"
              className="w-full justify-center"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onSelectScene) onSelectScene(DEMO_SCENE);
                else openDemo();
              }}
              showArrow
            >
              Book Executive Demo
            </GradientButton>
          </div>
        </div>
      )}
    </header>
  );
};

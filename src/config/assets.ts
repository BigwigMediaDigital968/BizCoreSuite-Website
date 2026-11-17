
/**
 * Bizcore Suite — Centralized Asset Catalog
 * Every image, dashboard mockup, brand logo, and avatar used in the application is defined here.
 *
 * Dashboard / role / module images are DUMMY stock photos loaded by direct URL
 * from Unsplash (images.unsplash.com).
 * Replace each `src` with a real product screenshot before launch.
 */

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

const defaultBlur = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'%3Crect width='100%25' height='100%25' fill='%23EEF3FF'/%3E%3Ccircle cx='50' cy='30' r='20' fill='%231D4ED8' fill-opacity='0.15'/%3E%3C/svg%3E";

export const siteAssets = {
  hero: {
    dashboard: {
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&h=750&q=80",
      alt: "Bizcore Suite Central Command Dashboard showing real-time multi-branch revenue and HR telemetry",
      width: 1200,
      height: 750,
      blurDataURL: defaultBlur,
    }
  },

  logos: [
    { id: "logo-01", name: "ApexCorp", src: "/placeholders/logos/logo-01.svg", width: 200, height: 60, alt: "ApexCorp Enterprise Logo" },
    { id: "logo-02", name: "ZenithHR", src: "/placeholders/logos/logo-02.svg", width: 200, height: 60, alt: "ZenithHR Systems Logo" },
    { id: "logo-03", name: "FlowSync", src: "/placeholders/logos/logo-03.svg", width: 200, height: 60, alt: "FlowSync Logistics Logo" },
    { id: "logo-04", name: "OmniScale", src: "/placeholders/logos/logo-04.svg", width: 200, height: 60, alt: "OmniScale Retail Group Logo" },
    { id: "logo-05", name: "CloudNest", src: "/placeholders/logos/logo-05.svg", width: 200, height: 60, alt: "CloudNest Infrastructure Logo" },
    { id: "logo-06", name: "VertexAI", src: "/placeholders/logos/logo-06.svg", width: 200, height: 60, alt: "VertexAI Technologies Logo" },
    { id: "logo-07", name: "PulsePoint", src: "/placeholders/logos/logo-07.svg", width: 200, height: 60, alt: "PulsePoint Diagnostics Logo" },
    { id: "logo-08", name: "AeroVanguard", src: "/placeholders/logos/logo-08.svg", width: 200, height: 60, alt: "AeroVanguard Global Logo" },
    { id: "logo-09", name: "FinScale", src: "/placeholders/logos/logo-09.svg", width: 200, height: 60, alt: "FinScale Payments Logo" },
    { id: "logo-10", name: "NordicRetail", src: "/placeholders/logos/logo-10.svg", width: 200, height: 60, alt: "NordicRetail Chain Logo" },
    { id: "logo-11", name: "HyperGro", src: "/placeholders/logos/logo-11.svg", width: 200, height: 60, alt: "HyperGro Digital Agency Logo" },
    { id: "logo-12", name: "Synthetix", src: "/placeholders/logos/logo-12.svg", width: 200, height: 60, alt: "Synthetix Labs Logo" },
    { id: "logo-13", name: "DataMinds", src: "/placeholders/logos/logo-13.svg", width: 200, height: 60, alt: "DataMinds Analytics Logo" },
    { id: "logo-14", name: "KryptonPay", src: "/placeholders/logos/logo-14.svg", width: 200, height: 60, alt: "KryptonPay Global Logo" },
    { id: "logo-15", name: "BeaconOps", src: "/placeholders/logos/logo-15.svg", width: 200, height: 60, alt: "BeaconOps Solutions Logo" },
    { id: "logo-16", name: "Stratosphere", src: "/placeholders/logos/logo-16.svg", width: 200, height: 60, alt: "Stratosphere Holdings Logo" },
  ],

  // Role images live directly on each role object in config/site.ts (`roles[].image.src`).

  // Module images live directly on each module object in config/modules.ts (`image.src`).

  avatars: {
    marcus: { src: "/placeholders/avatars/avatar-1.svg", alt: "Marcus Vance, CEO of AeroVanguard", width: 100, height: 100 },
    priya: { src: "/placeholders/avatars/avatar-2.svg", alt: "Priya Nair, COO of OmniHealth", width: 100, height: 100 },
    carlos: { src: "/placeholders/avatars/avatar-3.svg", alt: "Carlos Rivera, Head of People at FinScale", width: 100, height: 100 },
    elena: { src: "/placeholders/avatars/avatar-4.svg", alt: "Elena Rostova, MD of Nordic Retail", width: 100, height: 100 },
  }
};

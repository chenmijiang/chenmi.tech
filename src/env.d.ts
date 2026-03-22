import "../.astro/types";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: () => void;
      };
    };
  }

  interface ImportMetaEnv {
    readonly IPC?: string;
    readonly ICPLINK?: string;
  }
}

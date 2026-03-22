export interface IcpRecord {
  text: string;
  link: string;
}

interface IcpEnv {
  IPC?: string;
  ICPLINK?: string;
}

export function getIcpRecord(env: IcpEnv): IcpRecord | null {
  const text = env.IPC?.trim();
  const link = env.ICPLINK?.trim();

  if (!text || !link) {
    return null;
  }

  return { text, link };
}

export type CelebrationNotice = {
  message: string;
  title: string;
};

let pendingNotice: CelebrationNotice | null = null;

export function queueCelebrationNotice(notice: CelebrationNotice) {
  pendingNotice = notice;
}

export function consumeCelebrationNotice() {
  const notice = pendingNotice;
  pendingNotice = null;
  return notice;
}

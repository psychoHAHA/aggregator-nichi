export function normalizeReels(raw) {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    title: String(raw.title ?? ''),
    text: String(raw.text ?? ''),
    avatar: String(raw.avatar ?? ''),
    preview: String(raw.preview ?? ''),
    items: Array.isArray(raw.items)
      ? raw.items
          .map((i) => ({
            src: String(i.src ?? ''),
            duration: Number(i.duration ?? 5000),
          }))
          .filter((i) => i.src)
      : [],
  };
}

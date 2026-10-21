export type Member = {
  id: string;
  name: string;
};

/** Data boundary for member persistence. Replace with an API-backed adapter later. */
export interface MemberRepository {
  getMembers(): Promise<Member[]>;
  createMember(name: string): Promise<Member>;
  getSelectedMemberIds(): Promise<string[]>;
  saveSelectedMemberIds(ids: string[]): Promise<void>;
}

const membersKey = "btm.members";
const selectedMembersKey = "btm.selectedMemberIds";

function readJson<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function createId() {
  return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const localStorageMemberRepository: MemberRepository = {
  async getMembers() {
    return readJson<Member[]>(membersKey, []);
  },

  async createMember(name) {
    const member = { id: createId(), name };
    const members = readJson<Member[]>(membersKey, []);
    window.localStorage.setItem(membersKey, JSON.stringify([...members, member]));
    return member;
  },

  async getSelectedMemberIds() {
    return readJson<string[]>(selectedMembersKey, []);
  },

  async saveSelectedMemberIds(ids) {
    window.localStorage.setItem(selectedMembersKey, JSON.stringify(ids));
  },
};

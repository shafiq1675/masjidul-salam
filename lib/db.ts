import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db, secondaryAuth } from "./firebase";

// ── Types ────────────────────────────────────────────────────────────────────

export type FsEvent = {
  id?: string;
  title: string;
  date: string;
  time: string;
  category: string;
  location: string;
  description: string;
  status: "Published" | "Draft";
};

export type FsDonation = {
  id?: string;
  donor: string;
  email: string;
  amount: number;
  category: string;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Refunded";
};

export type FsMember = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  status: "Active" | "Inactive";
};

export type PrayerEntry = { name: string; adhan: string; iqama: string };

export type PrayerTimesDoc = {
  method: string;
  prayers: PrayerEntry[];
  jumuah: { firstKhutbah: string; iqama: string; khateeb: string };
};

// ── Collection refs ──────────────────────────────────────────────────────────

const eventsCol    = collection(db, "events");
const donationsCol = collection(db, "donations");
const membersCol   = collection(db, "members");
const prayerRef    = doc(db, "config", "prayerTimes");

// ── Events ────────────────────────────────────────────────────────────────────

export function subscribeEvents(cb: (rows: FsEvent[]) => void): Unsubscribe {
  return onSnapshot(query(eventsCol, orderBy("date", "asc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FsEvent)))
  );
}
export const addEvent    = (data: Omit<FsEvent, "id">) =>
  addDoc(eventsCol, { ...data, createdAt: serverTimestamp() });
export const updateEvent = (id: string, data: Partial<Omit<FsEvent, "id">>) =>
  updateDoc(doc(db, "events", id), data);
export const deleteEvent = (id: string) =>
  deleteDoc(doc(db, "events", id));

// ── Donations ─────────────────────────────────────────────────────────────────

export function subscribeDonations(cb: (rows: FsDonation[]) => void): Unsubscribe {
  return onSnapshot(query(donationsCol, orderBy("date", "desc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FsDonation)))
  );
}
export const addDonation    = (data: Omit<FsDonation, "id">) =>
  addDoc(donationsCol, { ...data, createdAt: serverTimestamp() });
export const updateDonation = (id: string, data: Partial<Omit<FsDonation, "id">>) =>
  updateDoc(doc(db, "donations", id), data);
export const deleteDonation = (id: string) =>
  deleteDoc(doc(db, "donations", id));

// ── Members ───────────────────────────────────────────────────────────────────

export function subscribeMembers(cb: (rows: FsMember[]) => void): Unsubscribe {
  return onSnapshot(query(membersCol, orderBy("name", "asc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FsMember)))
  );
}
export const addMember    = (data: Omit<FsMember, "id">) =>
  addDoc(membersCol, { ...data, createdAt: serverTimestamp() });
export const updateMember = (id: string, data: Partial<Omit<FsMember, "id">>) =>
  updateDoc(doc(db, "members", id), data);
export const deleteMember = (id: string) =>
  deleteDoc(doc(db, "members", id));

// ── Prayer Times (single config doc) ─────────────────────────────────────────

export function subscribePrayerTimes(cb: (data: PrayerTimesDoc | null) => void): Unsubscribe {
  return onSnapshot(prayerRef, (snap) =>
    cb(snap.exists() ? (snap.data() as PrayerTimesDoc) : null)
  );
}
export const savePrayerTimes = (data: PrayerTimesDoc) =>
  setDoc(prayerRef, { ...data, updatedAt: serverTimestamp() });

// ── Admin Users ───────────────────────────────────────────────────────────────

export type SectionKey = "dashboard" | "prayerTimes" | "events" | "donations" | "community" | "users";
export type Permission  = "read" | "write" | "delete";
export type SectionPerms = Record<SectionKey, Permission[]>;

export type AdminUser = {
  id?: string;
  uid?: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  permissions: SectionPerms;
};

export const ADMIN_ROLES: Record<string, SectionPerms> = {
  "Super Admin": {
    dashboard:   ["read"],
    prayerTimes: ["read", "write", "delete"],
    events:      ["read", "write", "delete"],
    donations:   ["read", "write", "delete"],
    community:   ["read", "write", "delete"],
    users:       ["read", "write", "delete"],
  },
  "Admin": {
    dashboard:   ["read"],
    prayerTimes: ["read", "write"],
    events:      ["read", "write", "delete"],
    donations:   ["read", "write"],
    community:   ["read", "write"],
    users:       ["read"],
  },
  "Prayer Manager": {
    dashboard:   ["read"],
    prayerTimes: ["read", "write"],
    events:      [],
    donations:   [],
    community:   [],
    users:       [],
  },
  "Event Manager": {
    dashboard:   ["read"],
    prayerTimes: [],
    events:      ["read", "write", "delete"],
    donations:   [],
    community:   [],
    users:       [],
  },
  "Finance Manager": {
    dashboard:   ["read"],
    prayerTimes: [],
    events:      [],
    donations:   ["read", "write", "delete"],
    community:   [],
    users:       [],
  },
  "Viewer": {
    dashboard:   ["read"],
    prayerTimes: ["read"],
    events:      ["read"],
    donations:   ["read"],
    community:   ["read"],
    users:       [],
  },
};

const adminUsersCol = collection(db, "adminUsers");

export function subscribeAdminUsers(cb: (rows: AdminUser[]) => void): Unsubscribe {
  return onSnapshot(query(adminUsersCol, orderBy("name", "asc")), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminUser)))
  );
}

export async function createAdminUser(
  data: Omit<AdminUser, "id" | "uid"> & { password: string }
) {
  const { password, ...userData } = data;
  const { user } = await createUserWithEmailAndPassword(secondaryAuth, data.email, password);
  await signOut(secondaryAuth);
  return addDoc(adminUsersCol, { ...userData, uid: user.uid, createdAt: serverTimestamp() });
}

export const updateAdminUser = (id: string, data: Partial<Omit<AdminUser, "id">>) =>
  updateDoc(doc(db, "adminUsers", id), data as Record<string, unknown>);

export const deleteAdminUser = (id: string) =>
  deleteDoc(doc(db, "adminUsers", id));

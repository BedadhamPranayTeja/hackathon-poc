// storage.js
// Simple LocalStorage wrapper for the POC
const POC_KEY = "hackathon_poc_v1";

function _load() {
  const raw = localStorage.getItem(POC_KEY);
  if (!raw)
    return {
      users: [],
      hackathons: [],
      teams: [],
      applications: [],
      submissions: [],
    };
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {
      users: [],
      hackathons: [],
      teams: [],
      applications: [],
      submissions: [],
    };
  }
}

function _save(state) {
  localStorage.setItem(POC_KEY, JSON.stringify(state));
}

export const storage = {
  getState() {
    return _load();
  },
  setState(next) {
    _save(next);
  },

  // helper operations
  addUser(user) {
    const s = _load();
    s.users.push(user);
    _save(s);
    return user;
  },
  updateUser(id, patch) {
    const s = _load();
    s.users = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
    _save(s);
  },
  addHackathon(h) {
    const s = _load();
    s.hackathons.push(h);
    _save(s);
    return h;
  },
  addTeam(t) {
    const s = _load();
    s.teams.push(t);
    _save(s);
    return t;
  },
  addApplication(a) {
    const s = _load();
    s.applications.push(a);
    _save(s);
    return a;
  },
  addSubmission(sub) {
    const s = _load();
    s.submissions.push(sub);
    _save(s);
    return sub;
  },
};

// for non-module usage (since index.html loads as normal script)
window.POCStorage = storage;

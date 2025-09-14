// app.js
// Vanilla JS single-file app UI for the POC

// tiny utilities
action = (fn) => (e) => {
  e && e.preventDefault && e.preventDefault();
  fn(e);
};
uid = () => Math.random().toString(36).slice(2, 9);
now = () => new Date().toISOString();

const store = window.POCStorage;

// seed data if empty
function seedIfEmpty() {
  const s = store.getState();
  if (s.users.length === 0) {
    store.addUser({
      id: "u1",
      email: "alice@example.com",
      display_name: "Alice",
      skills: ["frontend", "react"],
      bio: "I build UI",
    });
    store.addUser({
      id: "u2",
      email: "bob@example.com",
      display_name: "Bob",
      skills: ["backend", "python"],
      bio: "APIs & infra",
    });
  }
  if (s.hackathons.length === 0) {
    store.addHackathon({
      id: "h1",
      title: "Campus Hack 2025",
      description: "24hr campus hack",
      tags: ["ai", "web"],
      start_at: now(),
      end_at: null,
      created_at: now(),
      created_by: "u1",
    });
  }
}

// render helpers
function el(tag, cls, inner) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (inner !== undefined) node.innerHTML = inner;
  return node;
}

function renderApp() {
  const root = document.getElementById("app");
  root.innerHTML = "";
  const nav = el("div", "flex gap-3 mb-4");
  const btnHome = el("button", "px-3 py-1 rounded bg-slate-200", "Home");
  const btnDiscover = el(
    "button",
    "px-3 py-1 rounded bg-slate-200",
    "Discover"
  );
  const btnMy = el("button", "px-3 py-1 rounded bg-slate-200", "My Profile");
  nav.appendChild(btnHome);
  nav.appendChild(btnDiscover);
  nav.appendChild(btnMy);
  root.appendChild(nav);

  const content = el("div", "");
  root.appendChild(content);

  btnHome.onclick = () => renderHome(content);
  btnDiscover.onclick = () => renderDiscover(content);
  btnMy.onclick = () => renderProfile(content);

  // default view
  renderHome(content);
}

// HOME
function renderHome(container) {
  container.innerHTML = "";
  const h = el("div", "mb-4");
  h.appendChild(el("h2", "text-xl font-semibold", "Welcome"));
  h.appendChild(
    el(
      "p",
      "text-sm text-slate-600",
      "A lightweight POC — create hackathons and find teammates."
    )
  );
  container.appendChild(h);

  // quick create hackathon form
  const form = el("form", "space-y-2 p-3 border rounded bg-white");
  form.innerHTML = `
    <label class="block"><span class="text-sm font-medium">Hackathon title</span><input required name="title" class="mt-1 block w-full border p-2 rounded"/></label>
    <label class="block"><span class="text-sm font-medium">Tags (comma)</span><input name="tags" class="mt-1 block w-full border p-2 rounded"/></label>
    <div><button class="px-3 py-1 rounded bg-blue-600 text-white">Create Hackathon</button></div>
  `;
  form.onsubmit = action((e) => {
    const fd = new FormData(form);
    const title = fd.get("title");
    const tags = (fd.get("tags") || "")
      .toString()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const id = uid();
    const s = {
      id,
      title,
      description: "",
      tags,
      start_at: now(),
      created_at: now(),
      created_by: "u1",
    };
    store.addHackathon(s);
    renderHome(container);
  });
  container.appendChild(form);

  // trending / recent hackathons
  const s = store.getState();
  const list = el("div", "mt-4 grid gap-2");
  s.hackathons
    .slice()
    .reverse()
    .forEach((h) => {
      const card = el("div", "p-3 bg-white border rounded");
      card.innerHTML = `<div class="flex justify-between"><strong>${
        h.title
      }</strong><span class="text-xs text-slate-500">${
        h.tags ? h.tags.join(", ") : ""
      }</span></div>
      <p class="text-sm text-slate-600">${h.description || ""}</p>
      <div class="mt-2"><button data-id="${
        h.id
      }" class="apply-btn px-2 py-1 rounded bg-green-600 text-white text-sm">Apply / View</button></div>`;
      list.appendChild(card);
    });
  container.appendChild(el("h3", "mt-6 font-semibold", "Trending"));
  container.appendChild(list);

  // hookup apply buttons
  list
    .querySelectorAll(".apply-btn")
    .forEach(
      (b) =>
        (b.onclick = () =>
          renderHackathonPage(container, b.getAttribute("data-id")))
    );
}

// DISCOVER - search by skill
function renderDiscover(container) {
  container.innerHTML = "";
  const s = store.getState();
  container.appendChild(
    el("h2", "text-xl font-semibold mb-2", "Discover people & hackathons")
  );

  // search box
  const form = el("form", "flex gap-2 mb-4");
  form.innerHTML = `
    <input name="q" placeholder="search skill or role (e.g. react, backend)" class="flex-1 border p-2 rounded" />
    <button class="px-3 py-1 rounded bg-blue-600 text-white">Search</button>
  `;
  form.onsubmit = action(() => {
    const q = form.q.value.trim().toLowerCase();
    const people = s.users.filter(
      (u) =>
        (u.skills || []).some((sk) => sk.toLowerCase().includes(q)) ||
        (u.display_name || "").toLowerCase().includes(q)
    );
    renderDiscoverResults(container, people, s.hackathons);
  });
  container.appendChild(form);
  // default show top users
  renderDiscoverResults(container, s.users, s.hackathons);
}

function renderDiscoverResults(container, people, hackathons) {
  const wrap = el("div", "grid gap-4");
  const pplCard = el("div", "p-3 bg-white border rounded");
  pplCard.appendChild(el("h3", "font-semibold mb-2", "People"));
  if (people.length === 0)
    pplCard.appendChild(el("p", "", "No matching people"));
  people.forEach((u) => {
    const row = el("div", "flex items-center justify-between py-2 border-b");
    row.innerHTML = `<div><div class="font-medium">${
      u.display_name
    }</div><div class="text-xs text-slate-600">${
      u.skills ? u.skills.join(", ") : ""
    }</div></div>`;
    const btn = el(
      "button",
      "px-2 py-1 rounded bg-slate-200 text-sm",
      "Message"
    );
    btn.onclick = () =>
      alert("POC: messaging not implemented — try join team under a hackathon");
    row.appendChild(btn);
    pplCard.appendChild(row);
  });
  wrap.appendChild(pplCard);

  // hackathons list
  const hackCard = el("div", "p-3 bg-white border rounded");
  hackCard.appendChild(el("h3", "font-semibold mb-2", "Hackathons"));
  hackathons.forEach((h) => {
    const item = el("div", "py-2 border-b flex justify-between items-center");
    item.innerHTML = `<div><strong>${
      h.title
    }</strong><div class="text-xs text-slate-600">${
      h.tags ? h.tags.join(", ") : ""
    }</div></div>`;
    const btn = el(
      "button",
      "px-2 py-1 rounded bg-green-600 text-white text-sm",
      "View"
    );
    btn.onclick = () => renderHackathonPage(container, h.id);
    item.appendChild(btn);
    hackCard.appendChild(item);
  });
  wrap.appendChild(hackCard);

  // replace portion below search box
  // remove old results area if present
  const old = container.querySelector(".discover-results");
  if (old) old.remove();
  const block = el("div", "discover-results");
  block.appendChild(wrap);
  container.appendChild(block);
}

// PROFILE
function renderProfile(container) {
  container.innerHTML = "";
  const s = store.getState();
  const me = s.users[0] || null;
  container.appendChild(el("h2", "text-xl font-semibold mb-2", "My Profile"));
  const form = el("form", "space-y-2 p-3 bg-white border rounded");
  form.innerHTML = `
    <label class="block"><span class="text-sm">Display name</span><input name="display_name" class="mt-1 block w-full border p-2 rounded" value="${
      me ? me.display_name : ""
    }"/></label>
    <label class="block"><span class="text-sm">Email</span><input name="email" class="mt-1 block w-full border p-2 rounded" value="${
      me ? me.email : ""
    }"/></label>
    <label class="block"><span class="text-sm">Skills (comma)</span><input name="skills" class="mt-1 block w-full border p-2 rounded" value="${
      me ? (me.skills || []).join(", ") : ""
    }"/></label>
    <label class="block"><span class="text-sm">Bio</span><textarea name="bio" class="mt-1 block w-full border p-2 rounded">${
      me ? me.bio : ""
    }</textarea></label>
    <div><button class="px-3 py-1 rounded bg-blue-600 text-white">Save Profile</button></div>
  `;
  form.onsubmit = action(() => {
    const fd = new FormData(form);
    const user = me || { id: uid() };
    user.display_name = fd.get("display_name");
    user.email = fd.get("email");
    user.skills = (fd.get("skills") || "")
      .toString()
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    user.bio = fd.get("bio");
    if (me) store.updateUser(user.id, user);
    else store.addUser(user);
    alert("Profile saved (POC)");
    renderProfile(container);
  });
  container.appendChild(form);
}

// HACKATHON PAGE
function renderHackathonPage(container, hackId) {
  container.innerHTML = "";
  const s = store.getState();
  const hack = s.hackathons.find((h) => h.id === hackId);
  if (!hack) {
    container.appendChild(el("div", "", "Not found"));
    return;
  }

  container.appendChild(el("h2", "text-xl font-semibold mb-2", hack.title));
  const meta = el(
    "div",
    "mb-3 text-sm text-slate-600",
    `Tags: ${hack.tags ? hack.tags.join(", ") : ""}`
  );
  container.appendChild(meta);

  // teams list
  const teams = s.teams.filter((t) => t.hackathon_id === hackId);
  const panel = el("div", "grid gap-3");

  // create team form
  const teamForm = el("form", "p-3 bg-white border rounded");
  teamForm.innerHTML = `
    <label class="block"><span class="text-sm">Team name</span><input name="team_name" class="mt-1 block w-full border p-2 rounded"/></label>
    <label class="block"><span class="text-sm">Members (comma emails)</span><input name="members" class="mt-1 block w-full border p-2 rounded"/></label>
    <div class="mt-2"><button class="px-3 py-1 rounded bg-indigo-600 text-white">Create Team</button></div>
  `;
  teamForm.onsubmit = action(() => {
    const fd = new FormData(teamForm);
    const team = {
      id: uid(),
      hackathon_id: hackId,
      name: fd.get("team_name"),
      created_at: now(),
      members: (fd.get("members") || "")
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    store.addTeam(team);
    renderHackathonPage(container, hackId);
  });
  panel.appendChild(teamForm);

  const teamList = el("div", "p-3 bg-white border rounded");
  teamList.appendChild(el("h3", "font-semibold mb-2", "Teams"));
  if (teams.length === 0)
    teamList.appendChild(el("p", "", "No teams yet — create one!"));
  teams.forEach((t) => {
    const item = el("div", "py-2 border-b");
    item.innerHTML = `<div class="flex justify-between items-start"><div><strong>${
      t.name
    }</strong><div class="text-xs text-slate-600">Members: ${t.members.join(
      ", "
    )}</div></div></div>`;
    const joinBtn = el(
      "button",
      "mt-2 px-2 py-1 rounded bg-green-600 text-white text-sm",
      "Request to Join"
    );
    joinBtn.onclick = () => {
      const app = {
        id: uid(),
        hackathon_id: hackId,
        team_id: t.id,
        applicant_email:
          prompt("Enter your email to request join") || "guest@example.com",
        status: "pending",
        created_at: now(),
      };
      store.addApplication(app);
      alert("Join request submitted (POC)");
    };
    item.appendChild(joinBtn);
    teamList.appendChild(item);
  });
  panel.appendChild(teamList);

  // applications
  const apps = s.applications.filter((a) => a.hackathon_id === hackId);
  const appCard = el("div", "p-3 bg-white border rounded");
  appCard.appendChild(el("h3", "font-semibold mb-2", "Applications"));
  if (apps.length === 0) appCard.appendChild(el("p", "", "No applications"));
  apps.forEach((a) => {
    const row = el("div", "py-2 border-b flex justify-between items-center");
    row.innerHTML = `<div><div class="text-sm">${a.applicant_email}</div><div class="text-xs text-slate-600">team: ${a.team_id}</div></div>`;
    const accept = el(
      "button",
      "px-2 py-1 rounded bg-blue-600 text-white text-sm",
      "Accept"
    );
    accept.onclick = () => {
      a.status = "accepted";
      store.addApplication(a);
      alert("Accepted (POC) — manually add member to team in UI");
      renderHackathonPage(container, hackId);
    };
    row.appendChild(accept);
    appCard.appendChild(row);
  });
  panel.appendChild(appCard);

  container.appendChild(panel);
}

// bootstrap
seedIfEmpty();
renderApp();

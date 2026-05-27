import {
  Activity,
  Apple,
  BarChart3,
  Beef,
  CalendarDays,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Leaf,
  Moon,
  Plus,
  Salad,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Utensils,
  Waves
} from "lucide-react";
import { confirmSignUp, getCurrentUser, signIn, signOut, signUp } from "aws-amplify/auth";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { isAuthConfigured } from "./awsConfig";

type Meal = {
  id: number;
  name: string;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
};

type Goal = "cut" | "recompose" | "bulk";

type Section = "today" | "training" | "nutrition" | "coach";

type AuthMode = "signIn" | "signUp" | "confirm";

const localAccountKey = "vitallift-local-account";

const initialMeals: Meal[] = [
  { id: 1, name: "Greek yogurt, berries, oats", protein: 32, carbs: 54, fats: 9, calories: 425 },
  { id: 2, name: "Chicken bowl with avocado", protein: 48, carbs: 68, fats: 22, calories: 665 },
  { id: 3, name: "Salmon, sweet potato, greens", protein: 41, carbs: 46, fats: 26, calories: 592 }
];

const trainingPlan = [
  { day: "Mon", title: "Upper Strength", focus: "Bench, row, press", volume: "18 sets", icon: Dumbbell },
  { day: "Tue", title: "Lower Power", focus: "Squat, RDL, lunge", volume: "20 sets", icon: Activity },
  { day: "Thu", title: "Push Hypertrophy", focus: "Chest, delts, triceps", volume: "22 sets", icon: Flame },
  { day: "Fri", title: "Pull + Core", focus: "Back, biceps, anti-rotation", volume: "19 sets", icon: Waves }
];

const tips = [
  "Put 30-45 g protein in your first two meals to make the day easier.",
  "Keep heavy compounds at RPE 7-9, then chase clean reps on accessories.",
  "Add 5-10 minutes of incline walking after lifting on lower-stress days.",
  "Sleep is part of the program: protect a fixed wind-down time tonight."
];

const dailyPlans = [
  {
    chip: "Wednesday plan",
    title: "Recomposition day with upper-body strength bias.",
    copy: "Your meals are protein-forward and training volume is high enough to progress without burying recovery.",
    goal: "recompose" as Goal,
    protein: 35,
    carbs: 45,
    fats: 14
  },
  {
    chip: "Strength block",
    title: "Lower-body power day with higher carbohydrate support.",
    copy: "The coach moved more fuel around training so your top sets feel explosive without pushing calories too high.",
    goal: "bulk" as Goal,
    protein: 42,
    carbs: 78,
    fats: 18
  },
  {
    chip: "Recovery cut",
    title: "Calorie-controlled day with low-impact conditioning.",
    copy: "Protein stays high, carbs tighten slightly, and the workout shifts toward clean technique plus steps.",
    goal: "cut" as Goal,
    protein: 46,
    carbs: 34,
    fats: 12
  }
];

function macroTargets(weightKg: number, goal: Goal) {
  const goalMultiplier = goal === "cut" ? 29 : goal === "bulk" ? 38 : 33;
  const calories = Math.round(weightKg * goalMultiplier);
  const protein = Math.round(weightKg * 2.1);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
  return { calories, protein, carbs, fats };
}

function App() {
  const [activeSection, setActiveSection] = useState<Section>("today");
  const [planIndex, setPlanIndex] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [targetPulse, setTargetPulse] = useState(false);
  const [weightKg, setWeightKg] = useState(78);
  const [goal, setGoal] = useState<Goal>("recompose");
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [mealName, setMealName] = useState("");
  const [protein, setProtein] = useState(35);
  const [carbs, setCarbs] = useState(45);
  const [fats, setFats] = useState(14);
  const [authMode, setAuthMode] = useState<AuthMode>("signUp");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authMessage, setAuthMessage] = useState(isAuthConfigured ? "" : "Local demo mode is active. Deploy Cognito and set VITE_COGNITO_* variables for real cloud accounts.");
  const [authBusy, setAuthBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  const targets = useMemo(() => macroTargets(weightKg, goal), [weightKg, goal]);
  const plan = dailyPlans[planIndex];
  const totals = useMemo(
    () =>
      meals.reduce(
        (sum, meal) => ({
          protein: sum.protein + meal.protein,
          carbs: sum.carbs + meal.carbs,
          fats: sum.fats + meal.fats,
          calories: sum.calories + meal.calories
        }),
        { protein: 0, carbs: 0, fats: 0, calories: 0 }
      ),
    [meals]
  );

  const readiness = Math.min(98, Math.max(58, 72 + (targets.protein - Math.abs(targets.protein - totals.protein)) / 8));
  const newMealCalories = protein * 4 + carbs * 4 + fats * 9;

  useEffect(() => {
    if (!isAuthConfigured) {
      const localAccount = window.localStorage.getItem(localAccountKey);
      if (localAccount) {
        setCurrentUser(localAccount);
        setAuthEmail(localAccount);
        setAuthMessage("Signed in with a local demo account. Cloud accounts activate after Cognito is configured.");
      }
      return;
    }

    getCurrentUser()
      .then((user) => {
        setCurrentUser(user.signInDetails?.loginId || user.username);
        setAuthMessage("Signed in and ready to save your coaching data.");
      })
      .catch(() => setCurrentUser(""));
  }, []);

  function addMeal(event: FormEvent) {
    event.preventDefault();
    const name = mealName.trim() || "Custom performance meal";
    setMeals([{ id: Date.now(), name, protein, carbs, fats, calories: newMealCalories }, ...meals]);
    setMealName("");
    setActiveSection("nutrition");
  }

  function showSection(section: Section) {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function generateNextPlan() {
    const nextIndex = (planIndex + 1) % dailyPlans.length;
    const nextPlan = dailyPlans[nextIndex];
    setPlanIndex(nextIndex);
    setGoal(nextPlan.goal);
    setProtein(nextPlan.protein);
    setCarbs(nextPlan.carbs);
    setFats(nextPlan.fats);
    setWorkoutStarted(false);
    setSelectedTip(nextIndex % tips.length);
    showSection("today");
  }

  function adjustTargets() {
    setTargetPulse(true);
    showSection("training");
    window.setTimeout(() => setTargetPulse(false), 900);
  }

  function startWorkout() {
    setWorkoutStarted((started) => !started);
    showSection("training");
  }

  async function handleAuth(event: FormEvent) {
    event.preventDefault();

    if (!isAuthConfigured) {
      const normalizedEmail = authEmail.trim().toLowerCase();

      if (!normalizedEmail) {
        setAuthMessage("Enter an email to create or use a local demo account.");
        return;
      }

      if (authMode === "confirm") {
        setAuthMode("signIn");
        setAuthMessage("Local demo accounts do not need email confirmation. You can sign in now.");
        return;
      }

      window.localStorage.setItem(localAccountKey, normalizedEmail);
      setCurrentUser(normalizedEmail);
      setAuthEmail(normalizedEmail);
      setAuthMessage(authMode === "signUp" ? "Local demo account created. Your test profile is active on this browser." : "Signed in with your local demo account.");
      return;
    }

    setAuthBusy(true);
    setAuthMessage("");

    try {
      if (authMode === "signUp") {
        await signUp({
          username: authEmail,
          password: authPassword,
          options: {
            userAttributes: {
              email: authEmail
            }
          }
        });
        setAuthMode("confirm");
        setAuthMessage("Account created. Check your email for the confirmation code.");
      } else if (authMode === "confirm") {
        await confirmSignUp({
          username: authEmail,
          confirmationCode: authCode
        });
        setAuthMode("signIn");
        setAuthMessage("Email confirmed. Sign in to start saving your coaching profile.");
      } else {
        const result = await signIn({ username: authEmail, password: authPassword });
        if (result.isSignedIn) {
          setCurrentUser(authEmail);
          setAuthMessage("Signed in and ready to save your coaching data.");
        } else {
          setAuthMessage(`Next step: ${result.nextStep.signInStep}`);
        }
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Auth action failed.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (!isAuthConfigured) {
      window.localStorage.removeItem(localAccountKey);
      setCurrentUser("");
      setAuthMode("signIn");
      setAuthMessage("Signed out from the local demo account.");
      return;
    }

    await signOut();
    setCurrentUser("");
    setAuthMode("signIn");
    setAuthMessage("Signed out.");
  }

  return (
    <main className="app-shell">
      <aside className="side-nav" aria-label="Primary">
        <div className="brand-mark">
          <Leaf size={24} />
          <span>VitalLift</span>
        </div>
        <nav>
          <a className={activeSection === "today" ? "active" : ""} href="#today" onClick={() => setActiveSection("today")}><BarChart3 size={18} /> Today</a>
          <a className={activeSection === "training" ? "active" : ""} href="#training" onClick={() => setActiveSection("training")}><Dumbbell size={18} /> Training</a>
          <a className={activeSection === "nutrition" ? "active" : ""} href="#nutrition" onClick={() => setActiveSection("nutrition")}><Utensils size={18} /> Nutrition</a>
          <a className={activeSection === "coach" ? "active" : ""} href="#coach" onClick={() => setActiveSection("coach")}><Sparkles size={18} /> Coach</a>
        </nav>
        <div className="coach-note">
          <Moon size={18} />
          <p>Recovery target tonight</p>
          <strong>7h 45m</strong>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Nutritional coaching workspace</p>
            <h1>Build muscle, track macros, recover clean.</h1>
          </div>
          <button className="primary-action" type="button" onClick={generateNextPlan}>
            <Sparkles size={18} />
            Generate next plan
          </button>
        </header>

        <section id="today" className="hero-panel">
          <div className="hero-copy">
            <span className="date-chip"><CalendarDays size={16} /> {plan.chip}</span>
            <h2>{plan.title}</h2>
            <p>
              {plan.copy}
            </p>
            <div className="hero-actions">
              <button type="button" onClick={adjustTargets}><Target size={17} /> Adjust targets</button>
              <button className="ghost" type="button" onClick={startWorkout}>
                <Timer size={17} /> {workoutStarted ? "Pause workout" : "Start workout"}
              </button>
            </div>
          </div>
          <div className="vital-orbit" aria-label="Daily readiness score">
            <div className="score-ring">
              <span>{Math.round(readiness)}%</span>
              <small>Readiness</small>
            </div>
            <div className="metric-line">
              <strong>{totals.calories}</strong>
              <span>calories logged</span>
            </div>
          </div>
        </section>

        <section className="metrics-grid" aria-label="Nutrition metrics">
          <Macro label="Protein" value={totals.protein} target={targets.protein} unit="g" icon={Beef} />
          <Macro label="Carbs" value={totals.carbs} target={targets.carbs} unit="g" icon={Apple} />
          <Macro label="Fats" value={totals.fats} target={targets.fats} unit="g" icon={Salad} />
          <Macro label="Calories" value={totals.calories} target={targets.calories} unit="kcal" icon={Flame} />
        </section>

        <section className="account-panel" aria-label="Account">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Account</p>
              <h3>{currentUser ? "Profile connected" : authMode === "signUp" ? "Create your account" : authMode === "confirm" ? "Confirm email" : "Sign in"}</h3>
            </div>
            <Sparkles size={20} />
          </div>
          {currentUser ? (
            <div className="signed-in-row">
              <div>
                <strong>{currentUser}</strong>
                <span>Meals, macros, and training history can be linked to this profile.</span>
              </div>
              <button type="button" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAuth}>
              <label>
                Email
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              {authMode !== "confirm" && (
                <label>
                  Password
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete={authMode === "signUp" ? "new-password" : "current-password"}
                    required
                  />
                </label>
              )}
              {authMode === "confirm" && (
                <label>
                  Confirmation code
                  <input
                    value={authCode}
                    onChange={(event) => setAuthCode(event.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    required
                  />
                </label>
              )}
              <button type="submit" disabled={authBusy}>
                <Sparkles size={17} />
                {authBusy ? "Working..." : authMode === "signUp" ? "Create account" : authMode === "confirm" ? "Confirm account" : "Sign in"}
              </button>
              <div className="auth-switcher">
                <button type="button" onClick={() => setAuthMode("signUp")}>Create account</button>
                <button type="button" onClick={() => setAuthMode("signIn")}>Sign in</button>
                <button type="button" onClick={() => setAuthMode("confirm")}>Confirm email</button>
              </div>
            </form>
          )}
          {authMessage && <p className="auth-message">{authMessage}</p>}
        </section>

        <section className="two-column">
          <div id="nutrition" className="nutrition-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Food record</p>
                <h3>Macro log</h3>
              </div>
              <span>{meals.length} meals</span>
            </div>

            <form className="meal-form" onSubmit={addMeal}>
              <label>
                Meal
                <input value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder="e.g. Turkey rice bowl" />
              </label>
              <div className="macro-inputs">
                <NumberField label="Protein" value={protein} setValue={setProtein} />
                <NumberField label="Carbs" value={carbs} setValue={setCarbs} />
                <NumberField label="Fats" value={fats} setValue={setFats} />
              </div>
              <button type="submit"><Plus size={17} /> Add meal</button>
            </form>

            <div className="meal-list">
              {meals.map((meal) => (
                <article key={meal.id} className="meal-row">
                  <div>
                    <strong>{meal.name}</strong>
                    <span>{meal.protein}P / {meal.carbs}C / {meal.fats}F</span>
                  </div>
                  <p>{meal.calories} kcal</p>
                </article>
              ))}
            </div>
          </div>

          <div id="training" className={`training-panel ${targetPulse ? "pulse-panel" : ""}`}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Weightlifting</p>
                <h3>Training split</h3>
              </div>
              <TrendingUp size={20} />
            </div>
            {workoutStarted && (
              <div className="workout-status">
                <Timer size={18} />
                <span>Workout active</span>
                <strong>Upper Strength</strong>
              </div>
            )}
            <div className="goal-controls">
              <label>
                Body weight
                <input
                  type="number"
                  min={35}
                  max={220}
                  value={weightKg}
                  onChange={(event) => setWeightKg(Number(event.target.value))}
                />
              </label>
              <div className="segmented" aria-label="Goal">
                {(["cut", "recompose", "bulk"] as Goal[]).map((item) => (
                  <button
                    key={item}
                    className={goal === item ? "selected" : ""}
                    onClick={() => {
                      setGoal(item);
                      setActiveSection("training");
                    }}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="training-list">
              {trainingPlan.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.day} className="training-row">
                    <span>{item.day}</span>
                    <Icon size={20} />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.focus}</p>
                    </div>
                    <em>{item.volume}</em>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="coach" className="coach-panel">
          <div>
            <p className="eyebrow">Coach intelligence</p>
            <h3>Next best actions</h3>
          </div>
          <div className="tip-grid">
            {tips.map((tip, index) => (
              <article
                key={tip}
                className={selectedTip === index ? "selected-tip" : ""}
                onClick={() => {
                  setSelectedTip(index);
                  setActiveSection("coach");
                }}
              >
                <Check size={18} />
                <p>{tip}</p>
                <ChevronRight size={17} />
              </article>
            ))}
          </div>
          <p className="coach-selection">Selected focus: {tips[selectedTip]}</p>
        </section>
      </section>
    </main>
  );
}

function Macro({ label, value, target, unit, icon: Icon }: { label: string; value: number; target: number; unit: string; icon: typeof Activity }) {
  const progress = Math.min(100, Math.round((value / target) * 100));
  return (
    <article className="macro-card">
      <div>
        <Icon size={20} />
        <span>{label}</span>
      </div>
      <strong>{value}<small>{unit}</small></strong>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <p>{progress}% of {target}{unit}</p>
    </article>
  );
}

function NumberField({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) {
  return (
    <label>
      {label}
      <input type="number" min={0} value={value} onChange={(event) => setValue(Number(event.target.value))} />
    </label>
  );
}

export default App;

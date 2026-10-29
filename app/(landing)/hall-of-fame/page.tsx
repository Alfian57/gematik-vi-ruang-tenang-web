"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { communityService } from "@/services/api";
import { Navbar, Footer } from "@/components/layout";
import { PublicPageHero } from "../_components/PublicPageHero";
import { Users, Layers, Award, ArrowRight, Compass, Target, Star } from "lucide-react";
import { LeaderboardEntry, LevelConfig } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getUploadUrl } from "@/services/http/upload-url";
import "./hall-of-fame.css";

interface LevelGroup {
  level: number;
  badgeName: string;
  minExp: number;
  members: LeaderboardEntry[];
}

/* ─── Avatar ────────────────────────────────────────────────────── */

function MemberAvatar({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imageError, setImageError] = useState(false);
  const initial = (name?.trim()?.charAt(0) || "?").toUpperCase();
  const hasAvatar = Boolean(avatar && avatar.trim() !== "" && !imageError);

  const dims: Record<string, { box: string; text: string; px: number }> = {
    sm: { box: "w-11 h-11", text: "text-base", px: 44 },
    md: { box: "w-14 h-14", text: "text-xl", px: 56 },
    lg: { box: "w-20 h-20 md:w-24 md:h-24", text: "text-3xl", px: 96 },
  };
  const d = dims[size];

  if (hasAvatar) {
    const avatarSrc = typeof avatar === "string" ? (avatar.startsWith("http") ? avatar : getUploadUrl(avatar)) : "";
    return (
      <div
        className={`relative ${d.box} rounded-2xl overflow-hidden bg-gray-100 shadow-sm ring-2 ring-white`}
      >
        <Image
          src={avatarSrc}
          alt={name}
          fill
          sizes={`${d.px}px`}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${d.box} bg-gradient-to-br from-primary/80 to-red-600 rounded-2xl flex items-center justify-center ${d.text} font-bold text-white shadow-sm ring-2 ring-white`}
    >
      {initial}
    </div>
  );
}

/* ─── Featured Card (Non-ranked) ─────────────────────────────── */

function FeaturedCard({
  member,
  index,
}: {
  member: LeaderboardEntry;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.12, type: "spring", stiffness: 120 }}
      className={`hall-featured-card hall-featured-${index + 1}`}
    >
      <span className="hall-featured-orbit" aria-hidden="true" />
      <div className="hall-featured-top">
        <span>Sorotan komunitas</span>
        <Award className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="hall-featured-person">
        <MemberAvatar name={member.name} avatar={member.avatar} size="lg" />
        <div className="min-w-0">
          <h3 className="hall-featured-name" title={member.name}>{member.name}</h3>
          <p className="hall-featured-badge">{member.badge_name || "Anggota Komunitas"}</p>
        </div>
      </div>
      <div className="hall-featured-footer">
        <span>Langkah yang dirayakan</span>
        <strong>{Number(member.exp ?? 0).toLocaleString()} EXP</strong>
      </div>
    </motion.article>
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

const DEFAULT_LEVEL_INFO: Record<number, { badge_name: string; min_exp: number }> = {
  1: { badge_name: "Newcomer", min_exp: 0 },
  2: { badge_name: "Explorer", min_exp: 100 },
  3: { badge_name: "Learner", min_exp: 300 },
  4: { badge_name: "Intermediate", min_exp: 600 },
  5: { badge_name: "Advanced", min_exp: 1000 },
  6: { badge_name: "Expert", min_exp: 1500 },
  7: { badge_name: "Master", min_exp: 2000 },
  8: { badge_name: "Grandmaster", min_exp: 3000 },
  9: { badge_name: "Legend", min_exp: 5000 },
  10: { badge_name: "Guardian", min_exp: 10000 },
};

export default function HallOfFamePage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [apiLevels, setApiLevels] = useState<number[]>([]);
  const [levelConfigs, setLevelConfigs] = useState<LevelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const limit = 50;

  const rawTab = (searchParams.get("tab") || "all").toLowerCase();

  const activeLevel = useMemo<number | "all">(() => {
    if (rawTab === "all") return "all";
    if (!rawTab.startsWith("level-")) return "all";
    const parsed = Number(rawTab.replace("level-", ""));
    if (!Number.isInteger(parsed) || parsed <= 0) return "all";
    return parsed;
  }, [rawTab]);

  const handleTabChange = useCallback(
    (next: number | "all") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next === "all" ? "all" : `level-${next}`);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  /* ── Level grouping ── */

  const levelConfigsMap = useMemo(() => {
    const map = new Map<number, LevelConfig>();
    levelConfigs.forEach((cfg) => {
      map.set(Number(cfg.level), cfg);
    });
    return map;
  }, [levelConfigs]);

  const levelGroups = useMemo<LevelGroup[]>(() => {
    const membersByLevel = new Map<number, LeaderboardEntry[]>();

    users.forEach((member) => {
      const rawLevel = Number(member.level ?? 1);
      const level = Number.isInteger(rawLevel) && rawLevel > 0 ? rawLevel : 1;
      if (!membersByLevel.has(level)) membersByLevel.set(level, []);
      membersByLevel.get(level)?.push(member);
    });

    const knownLevels = (apiLevels.length > 0 ? apiLevels : Object.keys(DEFAULT_LEVEL_INFO).map(Number))
      .filter((level) => Number.isInteger(level) && level > 0);

    const extraLevelsFromUsers = Array.from(membersByLevel.keys())
      .filter((level) => !knownLevels.includes(level));

    const allLevels = Array.from(new Set([...knownLevels, ...extraLevelsFromUsers]))
      .sort((a, b) => b - a);

    return allLevels.map((level) => {
      const config = levelConfigsMap.get(level);
      const fallback = DEFAULT_LEVEL_INFO[level];
      const badgeName = config?.badge_name || fallback?.badge_name || (level >= 10 ? "Guardian" : `Tier ${level}`);
      const minExp = config?.min_exp ?? fallback?.min_exp ?? 0;

      return {
        level,
        badgeName,
        minExp,
        members: membersByLevel.get(level) ?? [],
      };
    });
  }, [apiLevels, levelConfigsMap, users]);

  /* ── Effects ── */

  useEffect(() => {
    const normalizedTab =
      activeLevel === "all" ? "all" : `level-${activeLevel}`;
    if (rawTab !== normalizedTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", normalizedTab);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  }, [activeLevel, pathname, rawTab, router, searchParams]);

  const visibleGroups = useMemo(() => {
    if (activeLevel === "all") return levelGroups;
    return levelGroups.filter((group) => group.level === activeLevel);
  }, [activeLevel, levelGroups]);

  useEffect(() => {
    if (activeLevel !== "all" && !loading && levelGroups.length > 0) {
      const hasLevel = levelGroups.some(
        (group) => group.level === activeLevel,
      );
      if (!hasLevel) handleTabChange("all");
    }
  }, [activeLevel, handleTabChange, levelGroups, loading]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const [leaderboardResult, levelConfigsResult] =
          await Promise.allSettled([
            communityService.getLeaderboard(limit),
            communityService.getLevelConfigs(),
          ]);

        if (leaderboardResult.status === "fulfilled") {
          setUsers(leaderboardResult.value.data || []);
        } else {
          setUsers([]);
        }

        if (levelConfigsResult.status === "fulfilled") {
          const configs = levelConfigsResult.value.data || [];
          setLevelConfigs(configs);
          const levels = configs
            .map((config) => Number(config.level))
            .filter(
              (level) => Number.isInteger(level) && level > 0,
            );
          setApiLevels(levels);
        } else {
          setLevelConfigs([]);
          setApiLevels([]);
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit]);

  /* ── Featured members (first 3 overall) ── */
  const featuredMembers = useMemo(() => users.slice(0, 3), [users]);
  const groupedForList = visibleGroups;

  return (
    <div className="public-page">
      <Navbar variant="back" />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-40 pb-16 sm:px-6 sm:pt-44 sm:pb-20 lg:px-8">
        <div className="hall-hero-shell mx-auto max-w-5xl">
          <PublicPageHero compact eyebrow="Ruang apresiasi" title={<>Hall of <span>Fame</span></>} description="Rayakan anggota yang menghadirkan energi positif, dukungan, dan inspirasi di komunitas Ruang Tenang." pose="trophy">
            <span className="hall-hero-meta"><Users className="h-4 w-4" aria-hidden="true" />{loading ? "Menyiapkan sorotan komunitas" : users.length > 0 ? `${users.length} anggota ditampilkan` : "Setiap langkah baik berarti"}</span>
          </PublicPageHero>
        </div>

        {loading ? (
          /* ── Loading Skeleton ── */
          <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
            {/* Featured skeleton */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border border-red-100 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 mb-3" />
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 mb-4" />
                    <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                    <div className="h-7 bg-gray-100 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-24 rounded-full bg-gray-100 animate-pulse"
                />
              ))}
            </div>

            {/* List skeleton */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-3xl border border-red-100 bg-white p-5">
                  <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-gray-100" /><div className="space-y-2"><div className="h-4 w-28 rounded bg-gray-100" /><div className="h-3 w-20 rounded bg-gray-100" /></div></div>
                  <div className="mt-5 h-5 w-32 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className="mx-auto max-w-5xl space-y-8 sm:space-y-10">
            {/* ── Featured Members ── */}
            {activeLevel === "all" && featuredMembers.length > 0 && (
              <section>
                <div className="hall-section-heading">
                  <div>
                    <p className="hall-section-kicker">ANGGOTA PILIHAN</p>
                    <h2>Wajah-wajah yang <span>menginspirasi.</span></h2>
                    <p>Setiap kontribusi punya cerita. Inilah beberapa anggota yang ingin kami sorot hari ini.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                  {featuredMembers.map((member, index) => (
                    <FeaturedCard
                      key={`featured-${member.user_id ?? index}`}
                      member={member}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Level Filter Tabs ── */}
            <div className="hall-filter">
              <div className="hall-filter-heading">
                <div className="flex items-center gap-2">
                  <span className="hall-filter-icon"><Layers className="h-4 w-4" aria-hidden="true" /></span>
                  <div><p className="hall-section-kicker">JELAJAHI PERJALANAN</p><h2>Temukan anggota di setiap level</h2></div>
                </div>
                <span className="hall-filter-count">{users.length} anggota ditampilkan</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filter level anggota">
                <button
                  onClick={() => handleTabChange("all")}
                  type="button"
                  aria-pressed={activeLevel === "all"}
                  className={`hall-filter-pill ${activeLevel === "all" ? "hall-filter-pill-active" : ""}`}
                >
                  Semua Level
                </button>

                {levelGroups.map((group) => (
                  <button
                    key={`filter-${group.level}`}
                    onClick={() => handleTabChange(group.level)}
                    type="button"
                    aria-pressed={activeLevel === group.level}
                    className={`hall-filter-pill ${activeLevel === group.level ? "hall-filter-pill-active" : ""}`}
                  >
                    Level {group.level}{" "}
                    <span className="opacity-70">
                      ({group.members.length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Member List ── */}
            {groupedForList.length > 0 ? (
              <div className="space-y-8">
                <div className="hall-section-heading hall-list-heading">
                  <div>
                    <p className="hall-section-kicker">DAFTAR ANGGOTA</p>
                    <h2>{activeLevel === "all" ? <>Langkah baik, <span>satu demi satu.</span></> : <>Anggota <span>Level {activeLevel}</span></>}</h2>
                    <p>{activeLevel === "all" ? "Anggota sorotan juga tercantum di sini agar semua perjalanan mudah dijelajahi." : "Lihat anggota dan langkah baik yang mereka bagikan pada level ini."}</p>
                  </div>
                </div>
                {groupedForList.map((group, groupIdx) => (
                  <motion.section
                    key={`list-level-${group.level}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(groupIdx * 0.05, 0.35),
                    }}
                    className="hall-level-panel"
                  >
                    {/* ── Level Panel Header ── */}
                    <div className="hall-level-panel-header">
                      <div className="hall-level-panel-title-group">
                        <span className="hall-level-badge-avatar" aria-hidden="true">
                          <Award className="h-5 w-5" />
                        </span>
                        <div className="hall-level-title-text">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3>Level {group.level}</h3>
                            <span className="hall-level-tier-badge">{group.badgeName}</span>
                          </div>
                          <div className="hall-level-meta-text">
                            <span>Syarat: {group.minExp > 0 ? `${group.minExp.toLocaleString()} EXP` : "0 EXP (Tingkat Awal)"}</span>
                            <span className="hall-level-meta-dot" aria-hidden="true" />
                            <span>{group.members.length > 0 ? `${group.members.length} anggota berbagi langkah baik` : "Tantangan Komunitas"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="hall-level-panel-status">
                        <span className={`hall-level-pill-count ${group.members.length === 0 ? "hall-level-pill-empty" : ""}`}>
                          {group.members.length > 0 ? (
                            <>
                              <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                              <span>{group.members.length} anggota</span>
                            </>
                          ) : (
                            <>
                              <Target className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                              <span>Tantangan Terbuka</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ── Level Content (Adaptive Layout) ── */}
                    {group.members.length === 0 ? (
                      /* ── Empty State per Level ── */
                      <div className="hall-level-empty-card">
                        <div className="hall-level-empty-left">
                          <div className="hall-level-empty-icon-wrap" aria-hidden="true">
                            <Compass className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">Menunggu Penjelajah Pertama</h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Belum ada anggota yang mencapai Level {group.level} ({group.badgeName}).
                              {group.minExp > 0
                                ? ` Kumpulkan minimal ${group.minExp.toLocaleString()} EXP untuk menjadi yang pertama!`
                                : " Mulai catat aktivitas untuk membuka level ini."}
                            </p>
                          </div>
                        </div>
                        <Link href={ROUTES.GAMIFICATION} className="hall-level-empty-cta">
                          <span>Lihat Cara Raih EXP</span>
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    ) : group.members.length === 1 ? (
                      /* ── Single Member: Elegant Horizontal Card ── */
                      <article className="hall-member-card-single">
                        <div className="hall-member-single-left">
                          <MemberAvatar name={group.members[0].name} avatar={group.members[0].avatar} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="hall-member-name" title={group.members[0].name}>
                                {group.members[0].name}
                              </h4>
                              <span className="hall-member-single-tag">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden="true" />
                                Pelopor Level
                              </span>
                            </div>
                            <p className="hall-member-badge-title">
                              {group.members[0].badge_name || group.badgeName || "Anggota Komunitas"}
                            </p>
                          </div>
                        </div>
                        <div className="hall-member-single-right">
                          <div className="hall-member-stat-box">
                            <span className="hall-member-stat-label">Progres Komunitas</span>
                            <strong className="hall-member-exp-badge">
                              {Number(group.members[0].exp ?? 0).toLocaleString()} EXP
                            </strong>
                          </div>
                        </div>
                      </article>
                    ) : (
                      /* ── Multiple Members: Balanced Responsive Grid ── */
                      <div className={group.members.length === 2 ? "hall-member-grid-2" : "hall-member-grid-3"}>
                        {group.members.map((member, memberIdx) => (
                          <article
                            key={`${group.level}-${member.user_id ?? "anon"}-${member.name}-${memberIdx}`}
                            className="hall-member-card"
                          >
                            <div className="hall-member-profile">
                              <MemberAvatar name={member.name} avatar={member.avatar} size="sm" />
                              <div className="min-w-0">
                                <h3 title={member.name}>{member.name}</h3>
                                <p>{member.badge_name || group.badgeName || "Anggota Komunitas"}</p>
                              </div>
                            </div>
                            <div className="hall-member-footer">
                              <span>Progres komunitas</span>
                              <strong>{Number(member.exp ?? 0).toLocaleString()} EXP</strong>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </motion.section>
                ))}
              </div>
            ) : (
              <div className="hall-empty hall-empty-filtered">
                <span className="hall-empty-icon"><Users className="h-7 w-7" aria-hidden="true" /></span>
                <div><h2>Belum ada anggota di level ini</h2><p>Coba level lain, atau tampilkan kembali semua perjalanan anggota.</p></div>
                <button type="button" onClick={() => handleTabChange("all")} className="hall-empty-link">Lihat semua level <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            )}
          </div>
        ) : (
          <section className="hall-empty hall-empty-global mx-auto max-w-5xl">
            <div className="hall-empty-art" aria-hidden="true"><Image src="/images/landing/mascot/community.webp" alt="" width={320} height={480} sizes="(max-width: 640px) 140px, 230px" /></div>
            <div className="hall-empty-copy">
              <p className="hall-section-kicker">RUANG INI AKAN BERTUMBUH</p>
              <h2>Belum ada anggota yang tampil di sini.</h2>
              <p>Ketika aktivitas komunitas tersedia, kami akan merayakan langkah-langkah baik anggotanya. Sambil menunggu, kamu bisa membaca cerita mereka.</p>
              <Link href={ROUTES.PUBLIC_STORIES} className="hall-empty-link">Jelajahi cerita komunitas <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </section>
        )}
      </main>

      <Footer variant="landing" />
    </div>
  );
}

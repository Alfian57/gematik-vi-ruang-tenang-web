"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Trash2,
  Clock,
  Heart,
  MessageSquare,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  ShieldAlert,
  MoreVertical,
  Ban,
  MessageSquareText,
  MessageCircle,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/utils";
import { parseApiDate } from "@/utils/date";
import { stripForumFormatTag } from "@/utils/forum-content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { ROUTES } from "@/lib/routes";
import { AdminMascotHero } from "@/components/shared/dashboard/AdminMascotHero";
import { useAdminForumDetail } from "./_hooks/useAdminForumDetail";

export default function AdminForumTopicPage() {
  const [postPage, setPostPage] = useState(1);
  const POSTS_PER_PAGE = 6;
  const {
    user,
    forum,
    posts,
    loading,
    replyContent,
    submitting,
    isLiked,
    likesCount,
    showDeletePostDialog,
    showDeleteForumDialog,
    isDeleting,
    router,
    setReplyContent,
    setDeletePostId,
    setShowDeletePostDialog,
    setShowDeleteForumDialog,
    handleReply,
    handleDeletePost,
    handleDeleteForum,
    handleToggleLike,
    handleTogglePostLike,
    handleToggleBestAnswer,
    handleToggleForumAccess,
  } = useAdminForumDetail();

  const totalPostPages = Math.ceil(posts.length / POSTS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (postPage - 1) * POSTS_PER_PAGE;
    return posts.slice(start, start + POSTS_PER_PAGE);
  }, [posts, postPage]);

  if (loading) {
    return (
      <div className="mx-auto min-h-[70vh] w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6 lg:py-8">
        <div className="h-10 w-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-44 animate-pulse rounded-[2rem] border border-slate-200 bg-white" />
        <div className="h-56 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        <div className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white" />
        <div className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-12 text-center shadow-sm">
          <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Topik tidak ditemukan</h1>
          <p className="mt-2 text-sm text-slate-500">
            Topik mungkin sudah dihapus atau slug tidak sesuai.
          </p>
          <Button
            className="mt-5 rounded-xl"
            onClick={() => router.push(ROUTES.ADMIN.FORUMS)}
          >
            Kembali ke Kelola Forum
          </Button>
        </div>
      </div>
    );
  }

  const authorInitial = forum.user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const authorAvatar = forum.user?.avatar?.trim() || "";
  const displayContent = stripForumFormatTag(forum.content);

  return (
    <>
      <ConfirmDialog
        isOpen={showDeletePostDialog}
        onClose={() => {
          setShowDeletePostDialog(false);
          setDeletePostId(null);
        }}
        onConfirm={handleDeletePost}
        title="Hapus Balasan"
        description="Apakah Anda yakin ingin menghapus balasan ini secara permanen sebagai admin?"
        confirmText="Hapus (Admin)"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={showDeleteForumDialog}
        onClose={() => setShowDeleteForumDialog(false)}
        onConfirm={handleDeleteForum}
        title="Hapus Topik Diskusi"
        description="Apakah Anda yakin ingin menghapus topik ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Topik (Admin)"
        cancelText="Batal"
        variant="danger"
        isLoading={isDeleting}
      />

      <div className="space-y-6 py-2 lg:py-4">
        {/* Hero Banner Topik */}
        <AdminMascotHero
          eyebrow={
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs">
                <ShieldAlert className="h-3 w-3" />
                ADMIN MODE
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(parseApiDate(forum.created_at), {
                  addSuffix: true,
                  locale: idLocale,
                })}
              </span>
            </div>
          }
          title={forum.title}
          description="Kelola diskusi, pantau kenyamanan interaksi anggota komunitas, dan berikan tanggapan resmi administrator."
          image="/images/landing/mascot/community.webp"
          imageAlt="Maskot RuNa memoderasi forum komunitas"
        />

        {/* Navigation & Header Actions (Outside Banner) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.ADMIN.FORUMS)}
            className="h-9 gap-2 rounded-xl border border-slate-200/80 bg-white/95 px-3.5 text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kelola Forum
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border border-slate-200/80 bg-white/95 px-3 text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="text-xs font-semibold">Tindakan Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600 font-medium"
                onClick={() => setShowDeleteForumDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Topik (Admin)
              </DropdownMenuItem>

              {user && user.id !== forum.user_id && (
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600 font-medium"
                  onClick={() => handleToggleForumAccess(forum.user_id)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Blokir Akses Forum Pengguna
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Flagged Status Banner */}
        {forum.is_flagged && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-sm">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-rose-600 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className="font-bold text-sm">Status Moderasi: Topik Dibatasi / Diblokir</h3>
              <p className="mt-1 text-xs leading-relaxed text-rose-800">
                Topik ini ditandai oleh moderator dan tidak tampil untuk pengguna umum. Sebagai admin,
                Anda memiliki akses penuh untuk meninjau dan membalas.
              </p>
            </div>
          </div>
        )}

        {/* Main Topic Question Card */}
        <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_48px_-38px_rgba(15,23,42,0.42)]">
          <div
            className="h-1.5 bg-gradient-to-r from-primary via-rose-400 to-amber-300"
            aria-hidden="true"
          />
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <Avatar className="h-11 w-11 shrink-0 ring-4 ring-slate-50">
                  <AvatarImage src={authorAvatar} alt={forum.user?.name || "User"} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 font-bold text-primary">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {forum.user?.name || "Pengguna"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      Penulis Topik
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {forum.user_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-none whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
              {displayContent || "Topik ini belum memiliki isi konten."}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={isLiked}
                  className={cn(
                    "h-9 gap-2 rounded-xl px-3.5 text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600",
                    isLiked && "bg-rose-50 text-rose-600"
                  )}
                  onClick={handleToggleLike}
                  title="Jumlah suka dari pengguna"
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current text-rose-500")} />
                  <span className="font-semibold text-xs">{likesCount} Suka</span>
                </Button>

                <div className="flex h-9 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 text-xs font-semibold text-slate-600">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <span>{posts.length} Balasan</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Conversation Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3 pt-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Percakapan Komunitas</h2>
              <p className="text-xs text-slate-500">Moderasi tanggapan dan pandu alur diskusi</p>
            </div>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-xs">
            {posts.length} Tanggapan
          </span>
        </div>

        {/* Admin Official Reply Form */}
        <section
          className="rounded-3xl border border-primary/25 bg-gradient-to-b from-white via-primary/[0.015] to-amber-50/[0.04] p-5 shadow-[0_14px_36px_-30px_rgba(15,23,42,0.45)] sm:p-6"
          aria-label="Tulis balasan admin"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">
                Tulis Balasan sebagai Administrator
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                Balasan Anda akan tampil secara resmi dengan status pengelola untuk membimbing diskusi.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Textarea
              aria-label="Isi balasan admin"
              placeholder="Tulis balasan resmi sebagai Admin..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-28 resize-y rounded-2xl border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:bg-white focus-visible:ring-primary/15"
              disabled={submitting}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Gunakan bahasa yang empatik, terstruktur, dan solutif.
              </p>
              <Button
                className="h-10 shrink-0 gap-2 rounded-xl px-5 shadow-sm transition hover:-translate-y-0.5"
                disabled={!replyContent.trim() || submitting}
                onClick={handleReply}
              >
                {submitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{submitting ? "Mengirim..." : "Kirim Tanggapan Admin"}</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Reply Posts List */}
        <section className="space-y-4 pb-8" aria-label="Daftar balasan">
          {paginatedPosts.map((post) => {
            const isAcceptedAnswer = post.is_accepted_answer ?? post.is_best_answer ?? false;
            const postLikesCount = post.upvotes_count ?? post.likes_count ?? 0;
            const postInitial = post.user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
            const postAvatar = post.user?.avatar?.trim() || "";

            return (
              <article
                key={post.id}
                className={cn(
                  "group relative rounded-2xl border p-4 sm:p-5 transition-all duration-200",
                  isAcceptedAnswer
                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 ring-2 ring-emerald-300/60 shadow-[0_12px_32px_-24px_rgba(16,185,129,0.35)]"
                    : "border-slate-200/80 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
                )}
              >
                {/* Best Answer Floating Badge */}
                {isAcceptedAnswer && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shadow-xs">
                    <Trophy className="h-3.5 w-3.5 text-emerald-700" />
                    JAWABAN TERBAIK (BEST ANSWER)
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      className={cn(
                        "h-10 w-10 shrink-0 ring-2",
                        isAcceptedAnswer ? "ring-emerald-300" : "ring-slate-100"
                      )}
                    >
                      <AvatarImage src={postAvatar} alt={post.user?.name || "User"} className="object-cover" />
                      <AvatarFallback
                        className={cn(
                          "text-xs font-bold",
                          isAcceptedAnswer
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {isAcceptedAnswer ? <Trophy className="h-4 w-4" /> : postInitial}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className={cn(
                            "text-sm font-bold truncate max-w-56",
                            isAcceptedAnswer ? "text-emerald-950" : "text-slate-900"
                          )}
                        >
                          {post.user?.name || "Pengguna"}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(parseApiDate(post.created_at), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">ID Anggota: {post.user_id}</p>
                    </div>
                  </div>

                  {/* Admin Actions for Post */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition",
                        isAcceptedAnswer
                          ? "bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                      )}
                      onClick={() => handleToggleBestAnswer(post)}
                      title={isAcceptedAnswer ? "Hapus status Jawaban Terbaik" : "Tandai sebagai Jawaban Terbaik"}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">
                        {isAcceptedAnswer ? "Lepas Terbaik" : "Pilih Terbaik"}
                      </span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg">
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletePostId(post.id);
                            setShowDeletePostDialog(true);
                          }}
                          className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600 font-medium"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Balasan (Admin)
                        </DropdownMenuItem>

                        {user && user.id !== post.user_id && (
                          <DropdownMenuItem
                            className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600 font-medium"
                            onClick={() => handleToggleForumAccess(post.user_id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Blokir Akses Forum
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Post Content */}
                <p
                  className={cn(
                    "mt-3 text-sm leading-relaxed whitespace-pre-wrap",
                    isAcceptedAnswer ? "text-emerald-950 font-normal" : "text-slate-700"
                  )}
                >
                  {post.content}
                </p>

                {/* Post Footer */}
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => handleTogglePostLike(post)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    title="Jumlah suka balasan"
                  >
                    <Heart className="h-3.5 w-3.5 text-slate-400" />
                    <span>{postLikesCount} Suka</span>
                  </button>
                </div>
              </article>
            );
          })}

          {posts.length === 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-16 text-center shadow-sm">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Belum ada balasan</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-400">
                Topik ini belum menerima tanggapan. Kirim tanggapan resmi admin di atas untuk memulai
                arah diskusi yang konstruktif.
              </p>
            </div>
          )}

          {totalPostPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={postPage}
                totalPages={totalPostPages}
                onPageChange={setPostPage}
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}

import type { PostListingData } from "../servers/get-home-data";
import { PostCard } from "./post-card";

type NewPostsSectionProps = {
  posts: readonly PostListingData[];
};

export function NewPostsSection({ posts }: NewPostsSectionProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <section className="bg-[#f3f5f7] py-16">
      <div className="mx-auto w-full max-w-350 px-4 lg:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[26px] font-extrabold text-[#045a84] md:text-[32px]">Bài đăng mới nhất</h2>
          <button
            type="button"
            className="hidden items-center gap-2 text-[16px] font-semibold text-[#0a6d97] md:inline-flex"
          >
            Xem tất cả
            <span aria-hidden>›</span>
          </button>
        </div>

        <div className="space-y-5">
          {posts.map((post, index) => (
            <PostCard key={("id" in post && post.id) || ("_id" in post && post._id) || `post-${index}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
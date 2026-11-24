import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { groupForSlug, hrefFor, TOPICS, type NavItem } from "@/lib/site-nav";
import { PAGES } from "@/lib/content";
import { Blocks } from "@/components/site/blocks";
import { Art } from "@/components/site/art";
import { RiskNotice } from "@/components/handla/common";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/info/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = PAGES[slug] ?? TOPICS[slug];
  return p ? { title: p.title, description: p.lead } : {};
}

function flatten(items: NavItem[]): NavItem[] {
  return items.flatMap((i) => (i.children ? i.children : [i]));
}

/** One page renders every content topic from the site menu. */
export default async function InfoPage({ params }: PageProps<"/info/[slug]">) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  const group = groupForSlug(slug);
  const parent = group?.items.find((i) => i.children?.some((c) => c.slug === slug));
  const siblings = parent?.children ?? (group ? group.items.filter((i) => !i.children) : []);

  return (
    <div className="bg-surface">
      <section className="bg-gradient-to-b from-mint-strong/60 to-mint">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[1fr_auto]">
          <div>
            <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted">
              <Link href="/" className="hover:text-fg">
                Start
              </Link>
              {group ? (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span>{group.label}</span>
                </>
              ) : null}
              {parent ? (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span>{parent.label}</span>
                </>
              ) : null}
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{page.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted">{page.lead}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {page.cta ? (
                <Link href={page.cta.href} className="btn bg-[#11142a] px-6 py-2.5 text-white hover:brightness-125 dark:bg-white dark:text-[#11142a]">
                  {page.cta.label}
                </Link>
              ) : null}
              {page.cta2 ? (
                <Link href={page.cta2.href} className="text-sm font-semibold text-brand hover:underline">
                  {page.cta2.label}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="hidden md:block">
            <Art kind={page.art} size={220} />
          </div>
        </div>
        {siblings.length > 1 ? (
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 pb-4">
            <div className="flex gap-2">
              {flatten(siblings).map((s) => (
                <Link key={s.label} href={hrefFor(s)} className={cn("chip bg-surface whitespace-nowrap", s.slug === slug && "chip-active")}>
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      {page.risk ? (
        <div className="mx-auto max-w-6xl px-4 pt-8">
          <RiskNotice />
        </div>
      ) : null}
      <Blocks blocks={page.blocks} />
      <p className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted">
        Spira är en demonstrationstjänst. Räntor, avgifter och erbjudanden på denna sida är exempel. Historisk avkastning är ingen garanti för framtida avkastning.
      </p>
    </div>
  );
}

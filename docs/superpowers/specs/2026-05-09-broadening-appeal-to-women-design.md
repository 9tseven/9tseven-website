# Broadening 9TSEVEN's appeal to women

**Date:** 2026-05-09
**Project:** 9tseven-website (KEA 4. semester)
**Status:** Design rationale (not implemented)

## 1. Context and problem

9TSEVEN sells unisex running apparel. The brand's product is intentionally gender-neutral, but the brand's *visible audience* — imagery, copy, and community signals — currently skews male. This is a common pattern in athletic and streetwear brands: the product is open, but the surrounding world the brand presents implicitly addresses men. As 9TSEVEN sees growing interest from women, the website should reflect that audience rather than ask women to project themselves into a male-coded space.

We are not adding a women's product line. The unisex thesis is part of the brand's identity. The goal is to widen *who the brand visibly speaks to and includes*, not to split the catalogue.

## 2. Why women bounce from unisex sport sites

Four mechanisms recur across the design and marketing literature. Each one is addressable through site-level changes alone.

**Default-male representation.** When imagery, mannequins, and copy implicitly depict a male body and a male experience as the norm, women read the brand as "not for me" within seconds of arrival. Caroline Criado Perez documents this across product and digital design in *Invisible Women* (2019), and Nielsen Norman Group's research on first-impression heuristics shows representation cues are processed pre-cognitively, before any product evaluation begins.

**Combat-coded language.** Linguistic studies of sport branding (Toffoletti & Thorpe, *Sport, Gender and Power*, 2018) show that copy built around "conquer," "dominate," "crush," "war on the road" reads as masculine-default. The vocabulary is not neutral — it filters audience. Running-brand copy that centers showing up, returning, and continuing rather than defeating performs more inclusively without losing intensity.

**Lack of community signals from women.** Social proof is gendered. Women evaluating an unfamiliar brand look for other women in the brand's orbit — not as endorsement, but as a feasibility signal that the brand is a place they can exist. When a Community page shows runners and the runners are uniformly men, the page is read as exclusionary even if no copy says so (NN/g, *Social Proof in E-Commerce*, 2020).

**Fit uncertainty on unisex garments.** Baymard Institute's e-commerce UX research consistently finds that unisex sizing without explicit fit guidance is a top cart-abandonment cause for women. Women often *want* the unisex aesthetic but can't tell whether the cut will work on their body. This is a conversion problem masquerading as a sizing problem.

## 3. Strategic direction: Community as the spine

The site's strongest asset for this work is the **Community page**, which is already in active development ([CommunityHero.tsx](app/components/CommunityPage/CommunityHero.tsx), [ImageSection.tsx](app/components/CommunityPage/ImageSection.tsx), [StorySection.tsx](app/components/CommunityPage/StorySection.tsx), [InstagramMarquee.tsx](app/components/CommunityPage/InstagramMarquee.tsx)). The Community narrative is the right place to lead because:

- It positions the brand as a *place* (Sunday Socials, the people, the runs) rather than a *product line*. Place-based brand identity is empirically more inclusive than performance-based identity.
- The existing copy already gestures in this direction. [StorySection.tsx:22](app/components/CommunityPage/StorySection.tsx#L22) already ends with *"The door stays open — we're just trying to widen it a little."* The thesis of this work is to take that line literally.
- It's the page most likely to be visited by someone deciding whether 9TSEVEN is "for them," so investment here has the highest leverage.

The Community page becomes the spine. Imagery, copy, and feature changes elsewhere on the site reinforce it.

## 4. Implementation: concrete moves on the existing site

### 4.1 Community page (primary)

**Image audit and rebalance — `ImageSection` and `InstagramMarquee`.**
Audit every image referenced via [constants.ts](app/components/CommunityPage/constants.ts) and the public photo sections. Target near-parity in visible women across hero, scroll-pinned imagery, and the Instagram marquee. Where existing photography skews male, source replacements from Sunday Socials runs that included women (or commission new photography for the next event). Document the audit as a before/after table in the project report — this is the most concrete piece of evidence in the rationale.

**Story-led "Voices" section — new component.**
Add a section to the Community page (between `StorySection` and `InstagramMarquee`) featuring 3–5 short profiles of community members, with explicit representation of women. Each profile is a portrait, a name, a one-line "why I run," and a short paragraph. This is the single most direct social-proof move in the literature — it tells women *"runners like me are here"* without making it the headline.

**Copy review of `StorySection`.**
The current copy is already inclusive in tone — *"first-timers to sub-three marathoners,"* *"the door stays open."* Audit the rest of the site for hyper-masculine framing and align it with this register. Keep intensity, drop combat metaphors.

### 4.2 Site-wide reinforcements (supporting)

**Hero and Featured Products imagery.**
The Community-led inclusivity loses force if the homepage hero or product photography reverts to male-default. Apply the same rebalancing principle to the homepage hero ([HeroSection](app/components/HeroSection)) and Featured Products ([FeaturedProductsSection](app/components/FeaturedProductsSection)).

**Fit transparency on PDPs.**
For each product, add a short "How it fits" note: a woman wearing the piece alongside a man, with height and size called out (e.g., *"Mia is 168 cm, wearing S. Jonas is 184 cm, wearing M."*). Baymard's research on unisex fit anxiety identifies this as the highest-impact PDP intervention.

**Newsletter and Community sign-up copy.**
Audit [Newsletter](app/components/Newsletter) and [NewsletterPopup](app/components/NewsletterPopup) for default-male phrasing. The implicit "you" in these forms should read as inviting to anyone reading.

## 5. How the rationale is defended in the report

Because the project's evidentiary standard is design rationale rather than primary user testing, the report makes the argument through three layered moves:

1. **Establish the mechanism with cited research** — the four bounce causes in section 2, each with at least one academic or industry source.
2. **Audit the current site against the mechanism** — a before-state assessment showing where 9TSEVEN currently triggers each cause (image counts by gender, copy samples, missing fit information).
3. **Map proposed changes to mechanisms** — every change in section 4 maps to one or more of the four causes. The report reads as cause → evidence → intervention, not as opinion.

Peer-brand precedent strengthens the argument. Tracksmith, Bandit Running, Satisfy, and Soar each made comparable moves in 2021–2023 and published rationale that can be cited as industry-validation of the approach.

## 6. References

- Criado Perez, C. (2019). *Invisible Women: Exposing Data Bias in a World Designed for Men.* Chatto & Windus.
- Toffoletti, K., & Thorpe, H. (2018). *Sport, Gender and Power: The Rise of Female Athletes in Global Sport.* Routledge.
- Nielsen Norman Group. *Social Proof in E-Commerce* (2020). https://www.nngroup.com/articles/social-proof-ux/
- Nielsen Norman Group. *First Impressions Matter: Why Great Visual Design Is Essential* (2019). https://www.nngroup.com/articles/first-impressions-human-automaticity/
- Baymard Institute. *E-Commerce Sizing & Fit UX Research* (ongoing).
- McKinsey & Company. *The State of Fashion* (annual reports, 2021–2024).
- Peer-brand case studies: Tracksmith Hare A.C. community programming; Bandit Running's NYC community-first launch positioning.

## 7. Out of scope

- Adding women-specific products or sizing (would contradict the unisex brand thesis).
- Primary user research with female participants (excluded by project methodology).
- Visual identity overhaul (typography, color system, logo) — current design system is retained.

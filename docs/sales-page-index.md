# Sales Page Template — Page Architecture (preset 66)

For each section: the **Template** block defines the structural slots, their fields, and the exact count of children in every repeating collection. The **Example (Javvy)** block mirrors the same structure populated with the preset's current content. Trees line up row-for-row so a content-generation layer can fill the template against the example.

---

## 1. Banner

### Template
- banner
    - badge
    - text
    - cta (text, url)
    - countdown? (label, duration)

### Example (Javvy)
- banner
    - badge: "🌼 SPRING SPECIAL 🌸"
    - text: "UP TO 58% OFF WITH FREE GIFTS"
    - cta: "Shop Now" → #order
    - countdown: enabled

---

## 2. Nav Bar

### Template
- navbar
    - logo
    - links[7] (label, url)

### Example (Javvy)
- navbar
    - logo: brand SVG
    - links:
      - "ORDER" → #order
      - "BEFORE & AFTER" → #before-after
      - "QUICK & EASY" → #quick-easy
      - "WHY US" → #why-us
      - "BENEFITS" → #benefits
      - "REVIEWS" → #reviews
      - "FAQ" → #faq

---

## 3. Hero

### Template
- Column 1 (50% width):
  - carousel
      - images[9]
- Column 2 (50% width):
  - starRating (value, starCount, label)
  - h1
  - p
  - divider
  - iconGrid
      - items[4] (icon?, label)
  - ctaButton (text, url)
  - accordion
      - items[3] (question, answer)

### Example (Javvy)
- Column 1 (50% width):
  - carousel
      - 9 images
- Column 2 (50% width):
  - starRating: 4.8/5, 5 stars, "18,623 verified reviews"
  - h1: "The Ultimate Iced Coffee for Your Health"
  - p: "Experience ultimate convenience with our indulgent, premium iced Protein Coffee. Perfect for customizing your favorite iced coffee and helping you meet your protein goals!"
  - divider
  - iconGrid
      - "10g Premium Protein per scoop"
      - "20 Flavorful Servings per bag"
      - "No Added Sugar — Real Arabica Coffee"
      - "Prebiotics + MCTs for gut & brain health"
  - ctaButton: "CLAIM YOUR DISCOUNT →" → #order
  - accordion
      - "How do I prepare Javvy?"
      - "How much caffeine per serving?"
      - "Shipping & Returns"

---

## 4. Logo Banner

### Template
- logoBanner
    - label
    - items[5] (imageUrl, alt)

### Example (Javvy)
- logoBanner
    - label: "AS SEEN ON"
    - items:
      - "Daily"
      - "InStyle"
      - "Flaunt"
      - "Mashable"
      - "Forbes"

---

## 5. Before & After

### Template
- h1
- iconGrid
    - items[6] (icon?, label)
- Column 1 (33.34% width):
  - video (videoUrl, poster, autoplay, loop, badge?, caption?)
  - h3
  - p
- Column 2 (33.33% width):
  - video (videoUrl, poster, autoplay, loop, badge?, caption?)
  - h3
  - p
- Column 3 (33.33% width):
  - video (videoUrl, poster, autoplay, loop, badge?, caption?)
  - h3
  - p

### Example (Javvy)
- h1: "Hit Your Transformation Goals with Guilt-Free Indulgent Coffee"
- iconGrid
    - "No Added Sugar"
    - "Real Coffee"
    - "Clean Label"
    - "Waistline-Friendly"
    - "No Added Sugar"
    - "Real Coffee"
- Column 1 (33.34% width):
  - video
      - (no badge or caption)
  - h3: "Feel Your Best & Build Strength 🔥"
  - p: "Power up with 20g of premium whey protein in every two scoops. Own your routine, feel your best, and fuel the strength to thrive."
- Column 2 (33.33% width):
  - video
      - (no badge or caption)
  - h3: "Keep the Flavor, Skip the Sugar 🍩"
  - p: "Treat yourself to guilt-free sweetness with premium protein that has no added sugar, helping you feel full throughout the day."
- Column 3 (33.33% width):
  - video
      - (no badge or caption)
  - h3: "Stay Focused & Energized 🎯"
  - p: "80mg of caffeine per serving delivers the perfect balance to keep you in the zone and energized, without the jitter."

---

## 6. Sticky CTA

### Template
- stickyBottomCta (text, url)

### Example (Javvy)
- stickyBottomCta: "Order Now - 58% OFF →" → #order

---

## 7. How It Works

### Template
- h1
- p
- Column 1 (33.34% width):
  - video (videoUrl, poster, autoplay, loop, badge?, caption?)
- Column 2 (33.34% width):
  - video (videoUrl, poster, autoplay, loop, badge?, caption?)
- Column 3 (33.34% width):
  - video (videoUrl, poster, autoplay, loop, badge?, caption?)

### Example (Javvy)
- h1: "1-2 Scoops a Day to Build Your Wellness & Confidence"
- p: "Sip your way to your best self and feel incredible from sunrise to sunset*."
- Column 1 (33.34% width):
  - video
      - badge: "Step 1"
      - caption: "Fill your cup with 8-16 oz of water or milk."
- Column 2 (33.34% width):
  - video
      - badge: "Step 2"
      - caption: "Mix in 1-2 scoops of Javvy's protein coffee."
- Column 3 (33.34% width):
  - video
      - badge: "Step 3"
      - caption: "Top with your favorite creamer, flavoring, or topping. Enjoy!"

---

## 8. Benefits

### Template
- h1
- benefitsGrid
    - leftItems[3] (icon, title, body)
    - centerImage
    - rightItems[3] (icon, title, body)

### Example (Javvy)
- h1: "Finally a Coffee You Won't Have to Quit"
- benefitsGrid
    - leftItems:
      - "Energy & Endurance" / "Enhances stamina, reduces fatigue, ideal for athletes."
      - "Muscle Building" / "Provides essential amino acids for growth & recovery."
      - "Strength & Power" / "Boosts power after resistance training."
    - centerImage
    - rightItems:
      - "Kickstart Your Day" / "80mg of caffeine per serving helps you energize your day from the start."
      - "Focus and Alertness" / "Sharpens focus and improves concentration for hours without the crash."
      - "Stay Full & Fueled" / "With 10g of protein, it helps curb mid-morning cravings and keeps you satisfied."

---

## 9. Product Comparison

### Template
- h1
- productComparison
    - products[3] (name, logo | headerImage) — first is highlighted column
    - metrics[7] (label, values[3] — one value per product)
    - footnote

### Example (Javvy)
- h1: "Cheaper, Healthier, More Nutritious"
- productComparison
    - products:
      - "Javvy" (highlighted)
      - "Grande Coffee*"
      - "Protein Shake**"
    - metrics:
      - "PRICE PER SERVING": $1.95 / $8.00 / $5.00
      - "CALORIES": 65 cal / 237cal / 160 cal
      - "SUGAR": <1g / 30.9g / 1g
      - "PROTEIN": 20g in 2 scoops / 2g / 30g
      - "CAFFEINE": 80mg / 133mg / 0mg
      - "PREBIOTICS": ✅ / ❌ / Sometimes
      - "MCTs": ✅ / ❌ / ❌
    - footnote: "*based on 16oz Starbucks Iced Caffè Mocha; **based on 11oz Premium Protein chocolate protein shake"

---

## 10. Competitor Comparison

### Template
- h1

### Example (Javvy)
- h1: "PLACEHOLDER - COMPETITOR COMPARISON SECTION"

---

## 11. Mechanism

### Template
- h1
- Column 1 (50% width):
  - p
  - img
  - p
  - p
  - p
- Column 2 (50% width):
  - p
  - img
  - p
  - p
  - p
- Column 3 (50% width):
  - p
  - img
  - p
  - p
  - p
- Column 4 (50% width):
  - p
  - img
  - p
  - p
  - p

### Example (Javvy)
- h1: "What Makes Javvy the Ultimate Iced Coffee for Your Health?"
- Column 1 (50% width):
  - p: "100% Real Coffee"
  - img
  - p: "Naturally rich in antioxidants that may help protect cells from damage and support overall wellness*"
  - p: "May support a healthy metabolism, which can assist with energy levels*"
  - p: "Can help promote cardiovascular health by supporting healthy circulation and heart function*"
- Column 2 (50% width):
  - p: "Premium Whey Protein"
  - img
  - p: "Delivers essential amino acids that support muscle growth and recovery — perfect for post-workout fuel*"
  - p: "May help curb appetite, making it a great ally for fitness goals*"
  - p: "Naturally rich in immunoglobulins, it can help support a healthy immune system and overall wellness*"
- Column 3 (50% width):
  - p: "Prebiotics for Better Gut Health"
  - img
  - p: "May help support healthy digestion and improve nutrient absorption*"
  - p: "Can support immune function and help your body defend against everyday threats*"
  - p: "May assist in regulating appetite and metabolism — supporting fitness goals*"
- Column 4 (50% width):
  - p: "Brain Boosting MCTs"
  - img
  - p: "Provides a fast-absorbing source of fuel that may support focus, memory, and mental clarity*"
  - p: "Offers sustained energy for the brain — without the sugar crashes*"
  - p: "May help support long-term cognitive health and brain function*"

---

## 12. Testimonials

### Template
- testimonial
    - title
    - subtitle
    - ratingSummary (value, totalCount, starDistribution[5])
    - videos[12] (videoUrl, posterUrl)
    - reviews[18] (name, date, rating, title, body, imageUrl?, verified, helpfulCount)

### Example (Javvy)
- testimonial
    - title: "Raving Reviews From Javvy Drinkers"
    - subtitle: "Join the Buzz: See What Javvy Drinkers Are Saying!"
    - ratingSummary: 4.8/5 across 18623 reviews
    - videos: 12 items
    - reviews: 18 items

---

## 13. Derisk

### Template
- img
- h1
- p
- iconGrid
    - items[4] (icon?, label)
- starRating (value, starCount, label)

### Example (Javvy)
- img
- h1: "Javvy Happiness Guarantee"
- p: "With Javvy, enjoy coffee your way, backed by our 100% Happiness Guarantee."
- iconGrid
    - "Free Shipping"
    - "30-Day Guarantee"
    - "Easy Returns"
    - "Secure Checkout"
- starRating: 5/5, 5 stars, "1,000,000+ HAPPY CUSTOMERS"

---

## 14. Order

### Template
- h1

### Example (Javvy)
- h1: "PLACEHOLDER - ORDER SECTION"

---

## 15. Final CTA

### Template
- h2
- p
- Column 1 (50% width):
  - image (src, aspectRatio, borderRadius)
- Column 2 (50% width):
  - p
  - h1
  - p
  - ctaButton (text, url)
  - countdown (label, duration — default 3:00 hours)
  - p
  - p

### Example (Javvy)
- h2: "Reaching #11 means one thing: you're truly serious about a better morning coffee routine."
- p: "✨ We don't hand these out every day… consider this an exclusive Javvy hookup, just for you."
- Column 1 (50% width):
  - image
- Column 2 (50% width):
  - p: "FREE GIFTS WITH YOUR ORDER"
  - h1: "UP TO 58% OFF FOR A LIMITED TIME ONLY!"
  - p: "This limited-time deal is in high demand and stock keeps selling out."
  - ctaButton: "GET 58% OFF →" → #order
  - countdown: label="DEAL ENDING IN:", duration=10h
  - p: "Sell-Out Risk: High  |  FAST shipping"
  - p: "Try it today with a 30-Day Money-Back Guarantee!"

---

## 16. FAQ

### Template
- Column 1 (55% width):
  - h1
  - p
- Column 2 (45% width):
  - accordion
      - items[14] (question, answer)

### Example (Javvy)
- Column 1 (55% width):
  - h1: "Frequently Asked Questions"
  - p: "You got questions. We got answers."
- Column 2 (45% width):
  - accordion
      - "What is Protein Coffee?"
      - "What are the benefits of whey protein?"
      - "How much caffeine is each serving?"
      - "What is the benefit of a prebiotic in protein?"
      - "What is goMCT?"
      - "Is there really no sugar added?"
      - "Is Protein Coffee dairy free?"
      - "What is the shelf life of Protein Coffee?"
      - "How many servings are in each bag?"
      - "How should I prepare Protein Coffee?"
      - "Can I drink Protein Coffee before or after a workout?"
      - "What if I don't like the taste?"
      - "Can I make a one-time purchase without subscribing?"
      - "Do you offer samples?"

---

## 17. Footer

### Template
- footer
    - logo
    - links[4] (label, url)
    - copyright
    - disclaimer

### Example (Javvy)
- footer
    - logo: brand SVG
    - links:
      - "Terms of Service" → #
      - "Privacy Policy" → #
      - "Contact Us" → #
      - "Returns & Refunds" → #
    - copyright: "© 2026 Your Company. All rights reserved."
    - disclaimer: "*Special offer valid only on first order. Subscription renews every 30 days. Max one offer per customer."

---


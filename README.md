# Fox & Timber Website

## Run locally
Because the header and footer are loaded from `/includes/`, do not double-click the HTML files directly. Start a local web server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

GitHub Pages serves the includes correctly over HTTP. The included `.nojekyll` file prevents Jekyll processing.

## Structure
- `/css/styles.css`
- `/js/scripts.js`
- `/img/`
- `/includes/header.htm`
- `/includes/footer.htm`
- `/index.html`
- `/who.html`
- `/what.html`
- `/portfolio.html`
- `/contact.html`

## Required edits before launch
1. Replace placeholder mailing address and phone number in `contact.html`.
2. Replace every social media `href="#"` in `includes/header.htm` and `includes/footer.htm`.
3. Replace the scheduler URL `https://cal.com/your-username` in `contact.html`.

## Scheduling options

### Cal.com
1. Create a Cal.com account.
2. Create an event type such as `30-minute brand consultation`.
3. Replace the placeholder link with your public event URL.
4. For an inline embed, copy Cal.com's embed code into `.scheduler-placeholder`.

### Calendly
1. Create a Calendly event type.
2. In Calendly, choose **Share > Add to website > Inline embed**.
3. Replace the `.scheduler-placeholder` contents with the provided embed markup.
4. Calendly adds its own JavaScript. Keep it only on `contact.html`.

### Acuity Scheduling
Use **Scheduling Page Link > Embed Scheduler**, then paste the provided iframe/script in place of the placeholder.

## Design notes
- Mobile menu is fixed at the bottom right through tablet portrait.
- Desktop navigation begins at 64rem.
- Google Fonts: Cormorant Garamond and Inter.
- Font Awesome loads through `css/styles.css`.
- Uploaded logos and artwork are used without creating new logo variants.
- CSS handles nearly all animation; JavaScript is limited to includes, menu behavior, reveal activation, and portfolio modal behavior.

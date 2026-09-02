import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';

// Draft wording — Joshua rewrites in his voice.
export const ticker: ProjectPageData = {
  slug: 'ticker',
  name: 'ticker',
  dates: 'Aug 2026',
  line: 'An MCP (Model Context Protocol) server that gives any agent my live market data and current positions: portfolio, quotes, option chains.',
  concepts: 'saved-session auth · read-only by design · self-hosted OAuth',
  stack: 'Python · Playwright · httpx · MCP',
  github: 'github.com/jjenkins2004/ticker',
  problem: {
    body: "Agents have gotten really good at evaluating positions and helping make trading decisions. But there is no connector between an agent and my brokerage, and Robinhood has no way to export current positions either. I was screenshotting the app or typing my trades in by hand, every single conversation. So I built the connector myself. I sign into Robinhood by hand once, in a real browser, and from then on the server reads the account and the live market through Robinhood's own API. Any model gets five typed MCP tools, and there is no code path that can place a trade.",
  },
  features: [
    {
      title: 'agent tools',
      media: [
        {
          kind: 'pre',
          pre: `get_robinhood_positions   the whole portfolio: stocks, spreads, legs
get_quotes                live quotes for any list of symbols
get_option_expirations    the dates a symbol has chains for
get_option_chain          calls and puts near the current price, or a span
get_option_quotes         risk numbers (greeks, IV) for specific contracts`,
        },
      ],
      body: "An agent can answer 'how is my FIG spread doing, and what does the chain look like around it' with real numbers, without me copying anything in.",
    },
    {
      title: 'positions shaped for a model',
      media: [
        {
          kind: 'pre',
          pre: `{ "symbol": "FIG", "strategy": "Long Call Spread",
  "net_mark": "7.625", "market_value": "762.50",
  "cost_basis": "650.00", "total_return": "112.50",
  "legs": [
    { "occ_symbol": "FIG   280121C00230000", "side": "long",
      "strike": "230", "mark": "12.40", "delta": "0.61" },
    { "occ_symbol": "FIG   280121C00260000", "side": "short",
      "strike": "260", "mark": "4.78",  "delta": "0.34" } ] }`,
          caption: 'occ_symbol = ticker + expiry (YYMMDD) + C/P + strike. Leg prices are per share; a contract covers 100 shares. mark = mid price, delta = price sensitivity.',
        },
      ],
      body: "A spread is one position with legs, the way the app shows it, and each leg has its own price and risk numbers. Symbols and strikes are formatted exactly like the chain tools', so the model can match a position against live quotes.",
    },
    {
      title: 'local or hosted',
      media: [
        {
          kind: 'pre',
          pre: `# local: stdio, any MCP client
$ python -m ticker mcp

# hosted: deploy on Railway, same server behind its own OAuth
$ railway up
# point any MCP client at <PUBLIC_URL>/mcp`,
        },
      ],
      body: 'You can run the tools locally over stdio, or deploy them behind OAuth that the server hosts itself. Tokens are self-contained signed JWTs, so there is no database, and the OAuth consent screen just asks for one shared password. A smoke test walks the deployed server end to end; the other 163 tests run without any network.',
    },
  ],
  difficulties: [
    {
      title: "reverse engineering robinhood's API",
      body: "Robinhood doesn't document any of this, so I worked out the API by watching the app use it: open the site signed in, pull up my positions, capture the calls the page makes, then rebuild them myself to see the arguments and the response objects. My first plan was actually to scrape the page itself, something like an extension pulling values out of the UI, and I built an inspect command that dumps a signed-in page's HTML, screenshot, and accessibility tree for exactly that. But the API route turned out better: it returns everything at once, already structured, and it doesn't depend on the UI staying the same.",
    },
    {
      title: 'robinhood auth',
      body: "The other half was getting requests authorized without ever holding my password. The login token lives in the browser's localStorage, which Playwright saves along with cookies, and it's a JWT, so I can check its expiry locally. The API also accepts a bare Authorization header: I got a 200 with the header alone and a 401 without it, so the browser isn't needed for requests at all. The first version drove every call through the signed-in page and took about 20 seconds to pull the portfolio; switching to plain HTTP calls through httpx got it to 1.6. The browser now only refreshes the token: the web app refreshes it on page load, so I open a tab, wait for it to load, close it, and read the new token back out.",
      media: [
        {
          kind: 'pre',
          pre: `login, once, by hand
  browser ---- sign in ----> robinhood
  Playwright saves cookies + localStorage
  bearer token (a JWT) written to disk

every read after that (browser stays closed)
  server --- GET, Authorization: Bearer <jwt> ---> robinhood API
  server <------------- 200 + positions JSON ----
  (no header? 401. the token alone is enough)

token near expiry (expiry read from the JWT, no network)
  server opens a tab from the saved session
  page refreshes its own token on load
  server reads the new token, closes the tab`,
        },
      ],
    },
  ],
};

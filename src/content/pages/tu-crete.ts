import type { ExperiencePageData } from '../../components/ProjectPage/ExperiencePage';

// The three processes and the two hops between them, each hop a request down and a reply up.
const processes = `┌─ {{window}} ─────────────────────────────────┐
│ react, the report pages                  │
└─────────────────────┬───────────────▲────┘
                      │ request       │ report, or
                      │               │ an error code
┌─ {{main process}} ──────▼───────────────┴────┐
│ electron, spawns the child once          │
│ and keeps its pipes                      │
└─────────────────────┬───────────────▲────┘
                      │ stdin         │ stdout
                      │ one json line │ one json line
┌─ {{python backend}} ────▼───────────────┴────┐
│ pyshark parses the capture,              │
│ the analysis scores it                   │
└──────────────────────────────────────────┘`;

// One request and one reply on the child's stdio. Values are synthetic.
const requestReply = `stdin  {"process": "THROUGHPUT",
        "path": "/traces/cafe-5ghz.pcap",
        "ap": "d4:6e:0e:12:34:56", "host": "3c:22:fb:ab:cd:ef"}\\n

stdout {"type": "THROUGHPUT", "data": {"avg_rssi": -58.2,
        "avg_retry": 0.09, "points": [...], ...}}\\n

stdout {"error": "No frames extracted", "code": "NO_FRAMES"}\\n`;

// The per-frame rate, then the per-window correction for retries.
const throughputModel = `per frame   airtime = T_frame + overhead
            rate    = payload bits / airtime

            overhead = 69 µs                      sent alone
                     = 64 µs × T_frame / T_group  in an aggregate

per window  attempts   = (frames + retries) / frames
            throughput = Σ payload bits / (Σ airtime × attempts)

T_frame  the frame's duration, as Wireshark computes it
T_group  the duration of the aggregate the frame was sent in`;

// The density score and its three parts, each normalized to 0..1.
const densityModel = `score = 0.5 × N + 0.35 × U + 0.15 × D     each part capped at 1

N   access points    Σ √max(0, rssi − floor) / N max
                     over the APs beaconing above the cutoff
U   airtime in use   busy % / U max
D   bits carried     √(Mbps / D max)`;

// Per-band constants measured around Chania.
const constants = `                          2.4 GHz     5 GHz
rssi floor (dBm)           -86.69    -89.37
beacon cutoff (per min)      27.2       210
N max                       75.24     48.46
U max (% airtime)           34.04     22.71
D max (Mbps)                 7.67     14.24`;

export const tuCrete: ExperiencePageData = {
  slug: 'tu-crete',
  org: 'tu crete',
  role: 'Software Engineer Intern',
  dates: 'Jun - Aug 2025',
  line: "Desktop app for Wi-Fi diagnosis from a packet capture: how crowded the channel is, how fast a link runs, and why, without a speed test occupying the channel. On traces around Chania the density score tracked retry rate at r = 0.75 on 5 GHz.",
  concepts: 'inter-process communication · field validation · Wi-Fi packet analysis',
  stack: 'Python · Pyshark · Electron · React · TypeScript',
  sections: [
    {
      title: 'context',
      body: "A speed test returns a speed only, and it occupies the channel while it runs. A packet capture sends nothing. I spent the summer of 2025 in Chania as an intern in the Information and Networks Lab at the Technical University of Crete, under Professor Ioannis Pefkianakis, who runs it. The brief was to sniff a channel with Wireshark, parse the capture, and report how dense the network is and how fast a link runs. I built it as a desktop app the lab can install and drop any capture into, and designed a metric for each report. The density score combines access point count, airtime, and traffic carried; the papers I found had used count or airtime alone. I spent the last weeks collecting traces around the city to calibrate it and check that it tracks contention. The code and the design report are on GitHub: [trace-analyzer](https://github.com/jjenkins2004/trace-analyzer).",
    },
    {
      title: 'the analyzer',
      layout: 'work',
      body: "A density report scores how busy the channel was over time. A throughput report estimates the downlink between one access point and one client and says why it is fast or slow. Both chart their metrics over the capture and overlay any two. The analyzer reads frame headers and radio metadata; payloads are never decoded.",
      subs: [
        {
          title: 'one pipe to python',
          line: "The window is React, the analysis is Python, and they talk over a child process's stdin and stdout, one JSON line each way.",
          blocks: [
            {
              label: 'three processes',
              body: "Wireshark's dissectors already decode every 802.11 field and Pyshark hands them to Python, so the analysis is Python. The window had to be something the lab could install, so it is Electron and React. Electron's main process sits between them: it spawns the Python backend once at startup, keeps its stdin and stdout as pipes, and owns the saved reports.",
              media: [{ kind: 'pre', pre: processes, tight: true }],
            },
            {
              label: 'one line in, one line out',
              body: "A request is one JSON line: which report, the capture path, and for throughput the two MAC addresses. The reply is one JSON line holding the whole report, so newlines are the message boundary and a readline on stdout hands the main process complete messages. A one-shot listener resolves the request, and a 60 second timer rejects it with a message that the capture may be too large. A backend error comes back as a JSON object with a code, and the window maps it to a message: no frames matched, or the backend failed.",
              media: [{ kind: 'pre', pre: requestReply }],
            },
            {
              label: 'the tradeoff',
              body: "One entry point means one request at a time, fragile buffering, and no way for the backend to push progress. Sockets or a local HTTP server would fix all three at the price of a port, a server lifecycle, and a second thing to package. When the app quits the child's stdin closes and the backend exits, and the packaged build ships it as a single PyInstaller binary next to the app.",
            },
          ],
        },
        {
          title: 'throughput from a passive capture',
          line: 'Downlink throughput between one access point and one client, estimated from the frames a sniffer overheard: payload bits over the airtime they cost, corrected for frame aggregation and retries.',
          blocks: [
            {
              label: 'bits over airtime',
              body: "The obvious estimate is the PHY data rate times the share of frames that were not retries. It ignores the rest of what a frame costs the channel: the preamble and signal field, the acknowledgment, and the short gap on either side of it. At 54 Mb/s that overhead is 54% of the airtime. So the rate is each data frame's payload bits over its full airtime: the duration Wireshark computes for the frame plus 69 microseconds for the acknowledgment and its two gaps.",
              media: [{ kind: 'pre', pre: throughputModel }],
            },
            {
              label: 'aggregated frames',
              body: "The first version underestimated badly on modern links, because 802.11n and later pack many frames into one transmission that pays the overhead once. Frames in the same aggregate share an id in the capture, so the overhead is charged once per group, 64 microseconds from what the traces showed, and split across its frames by each frame's share of the group's airtime.",
            },
            {
              label: 'retries a sniffer can see',
              body: "The textbook retry rate, retries over data frames, breaks in a passive capture. A sniffer often catches only the final successful copy of a frame with its retry bit set and never the attempts that failed, so a capture of nothing but retried frames scores a retry rate of 1 and a throughput of 0 while the client is receiving data fine. A retry is a delayed delivery, not a lost one, so the model counts attempts per delivered frame instead: two for a frame with the retry bit, one without, and the window's throughput is divided by that average. Two is a guess. Deriving it from the retry distribution is the next step.",
            },
            {
              label: 'the diagnosis',
              body: "The assignment's second question was why a link is fast or slow, so the report ends with a verdict. Three inputs are bucketed: average RSSI at -50 and -70 dBm; retry rate at 25% and 50%; and rate ratio, how close the observed MCS index sits to the highest one the link's 802.11 generation allows, bucketed at 0.5. Each combination maps to a hand-written verdict and a sentence of advice. Strong signal, high rate ratio and few retries is Optimal. Strong signal and few retries with a low rate ratio is Limited Rate, the access point capping the link. Strong signal and a high rate ratio with many retries is Interference.",
            },
            {
              label: 'how it did',
              body: "I ran a speed test on one device and sniffed from a second, on both bands, close to the access point, far from it, and walking. On 5 GHz the estimate landed about 10% under the speed test in two scenarios and 27% over in the two with the most retries, where the model charged every retry as exactly two tries and no backoff time. On 2.4 GHz it overestimated in every scenario, by 62% on average. The model only sees the frames between the two devices, and on a crowded band the airtime other devices take is invisible to it. In the walking tests the curve mirrored the walk, rising as I approached the access point and falling as I left.",
            },
          ],
        },
        {
          title: 'a density score',
          line: 'One number from 0 to 1 for how busy an 802.11 channel is, from three things a capture shows: nearby access points weighted by signal, airtime in use, and bits carried.',
          blocks: [
            {
              label: 'three parts, weighted',
              body: "The capture is cut into about twenty bins, a quarter second to thirty seconds each depending on its length, and every bin gets a weighted sum of three parts, each normalized to 0 to 1. Access points at 0.5, because interference grows about linearly with the number of active senders. Airtime in use at 0.35, because channel busy time tracks medium utilization at r ≈ 0.97 in the literature. Bits carried at 0.15, because traffic alone does not explain degradation in dense deployments, but it separates busy airtime full of data from busy airtime full of control and management frames. The report's score is the time-weighted average over the bins.",
              media: [{ kind: 'pre', pre: densityModel }],
            },
            {
              label: 'access points by proximity',
              body: "An access point counts only if it advertises at least a cutoff number of beacons per minute, which drops devices that show up for a few frames. Each one that passes contributes the square root of how far its average RSSI sits above a floor, so a strong nearby access point weighs more than a faint one but does not dominate the weaker ones. The sum is divided by the largest sum I measured.",
            },
            {
              label: 'calibrated on chania',
              body: "A score capped at 1 needs a ceiling someone can reach. My first version invented it: five access points at -45 dBm. The real constants came from a busy tourist Saturday at four spots, a café, the Venetian harbor, an internet café, and a dense residential street. At each I swept every channel for 30 seconds to find the busiest 2.4 GHz and 5 GHz channel, captured five minutes on each, and split it into one-minute bins. The floor is the 10th percentile of average RSSI, the beacon cutoff is a weighted 20th percentile of beacon rate (each access point weighted by the square root of its beacon rate, because a plain percentile on the left-skewed rates let anomalous broadcasters through), and each maximum is the largest bin value observed. Every constant is per band.",
              media: [{ kind: 'pre', pre: constants }],
            },
            {
              label: 'checked against retries',
              body: "There is no ground truth for density, so I tested the score against a symptom of it. Retries rise when a channel is contended. I captured one-minute traces at three locations, five times between noon and 8 pm, on the busiest channel of each band, and scored each one. The score correlated with retry rate at r = 0.61 on 2.4 GHz and r = 0.75 on 5 GHz. 2.4 GHz picks up non-Wi-Fi noise that causes retries the score cannot see, while 5 GHz has more non-overlapping channels, so its retries are more likely to come from Wi-Fi contention.",
            },
          ],
        },
      ],
    },
    {
      title: 'lessons',
      subs: [
        {
          title: 'read the literature first',
          body: "My first density score was made up: a signal strength scale I picked and a ceiling I imagined. Professor Pefkianakis had told me to do a literature search, and I built that first version before doing it. When I did, the papers measured density with one signal each and few combined them, and that reading is where the score came from, along with a reason for each weight. I learned to read what exists before designing my own, because the reading shows where your own contribution is.",
        },
        {
          title: 'validate on real data',
          body: "With no ground truth for density, I spent a Saturday sampling real places to set every constant, and picked a symptom the score should track to test it against. The throughput estimate got the same treatment against a speed test, which is how I found the 62% average overestimate on 2.4 GHz. I now decide what a number will be checked against before I finish designing it, and say where the constants came from. The cost is that the constants generalize only as far as the sampling behind them, four spots in one city.",
        },
      ],
    },
  ],
};

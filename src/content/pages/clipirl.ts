import type { ProjectPageData } from '../../components/ProjectPage/ProjectPage';

// The always-listening buffer animation: a green chunk enters, the amber
// oldest pops out and dissipates. Frames share one fixed size.
const bufTop = `                                              5 minute buffer
               ┌───────────┐               ┌──┬──┬──┬──┬──┬──┬──┐`;
const bufBottom = `               └───────────┘               └──┴──┴──┴──┴──┴──┴──┘
               AVAudioEngine             new chunk replaces oldest`;
const bufRow = (gap: string, cells: string, out = '') =>
  `${bufTop}\n{{builtInMic}} ──▶ │ inputNode │ ── tap ──▶ ${gap}${cells}${out}\n${bufBottom}`;
const CELLS = '│▒▒│▒▒│▒▒│▒▒│▒▒│▒▒│((▒▒))│';
const CELLS_NEW = '│[[▒▒]]│▒▒│▒▒│▒▒│▒▒│▒▒│▒▒│';
const bufferFrames = [
  bufRow(' [[▒▒]]', CELLS),
  bufRow('   ', CELLS_NEW, ' ((▒▒))'),
  bufRow('   ', CELLS_NEW, ' ((░░))'),
  bufRow('   ', CELLS_NEW),
];

// The saving-clips animation: cells turn green from newest (the walk),
// then the file appears and holds. Left-aligned; newest chunks on the left.
const clipRow = (green: number, out = '') =>
  '   │' + [0, 1, 2, 3, 4, 5, 6].map((j) => (j < green ? '[[▒▒]]' : '▒▒')).join('│') + '│' + out;
const clipFrame = (cellsRow: string) =>
  [
    '   slider set to 30 seconds',
    '   ┌──┬──┬──┬──┬──┬──┬──┐',
    cellsRow,
    '   └──┴──┴──┴──┴──┴──┴──┘',
    '   walk back from newest until 30 s is covered, then write the file',
  ].join('\n');
const clipFrames = [
  clipFrame(clipRow(0)),
  clipFrame(clipRow(1)),
  clipFrame(clipRow(2)),
  clipFrame(clipRow(3)),
  clipFrame(clipRow(3, ' ──▶ [[clip.m4a]]')),
  clipFrame(clipRow(3, ' ──▶ [[clip.m4a]]')),
  clipFrame(clipRow(3, ' ──▶ [[clip.m4a]]')),
  clipFrame(clipRow(3, ' ──▶ [[clip.m4a]]')),
];

// Draft wording. Joshua rewrites in his voice.
export const clipirl: ProjectPageData = {
  slug: 'clipirl',
  name: 'ClipIRL',
  dates: 'May 2024 - Mar 2025',
  line: 'An iOS recorder that saves the moment after it already happened. It keeps the last few minutes of audio in memory, and one tap saves a clip of 5 seconds to 5 minutes.',
  concepts: 'rolling audio buffer · retroactive capture · waveform editing',
  stack: 'Swift · SwiftUI · AVFoundation',
  github: 'github.com/skyeschao/ClipIRL',
  problem: {
    body: "A friend and I kept hitting the same problem when hanging out. Someone says something really funny, everyone loses it, and then it's gone. You can't pull out your phone and record something that already happened. Recording all day instead fills storage and drains the battery, and nobody ever listens back through the hours of audio it leaves behind.\n\nSo we built ClipIRL. While it's on, the app holds the last few minutes of audio in memory and writes nothing to disk. A Live Activity on the lock screen shows everyone that it's running. We shipped it to TestFlight and our friends made good clips.",
  },
  features: [
    {
      title: 'rolling buffer',
      media: [{ kind: 'anim', ms: 450, frames: bufferFrames }],
      body: "The engine keeps the mic open the whole time listening is on. Each chunk of samples from the hardware goes to the back of an in-memory buffer. Once the buffer covers five minutes, the oldest chunk drops as each new one arrives. Nothing is written to disk, so a full day of listening costs a fixed amount of memory. The buffer is a `Deque`, a queue that drops from the front cheaply, instead of an array. Dropping an array's first element shifts every element behind it, and this buffer holds thousands of chunks.",
    },
    {
      title: 'saving clips',
      media: [{ kind: 'anim', ms: 500, frames: clipFrames }],
      body: "The clip function walks the buffer backwards, counting samples until it has covered the requested length, then writes forward from that point into an `.m4a` file. The length comes from a slider, twelve steps from 5 seconds to 5 minutes.",
    },
    {
      title: 'waveform editor',
      media: [
        {
          kind: 'video',
          clips: [
            { src: '/demo/editor-controls.mp4', cap: 'playback controls' },
            { src: '/demo/editor-zoom.mp4', cap: 'pinch to zoom' },
            { src: '/demo/editor-cut.mp4', cap: 'mark and cut' },
          ],
        },
      ],
    },
    {
      title: 'live activity',
      media: [
        {
          kind: 'img',
          src: '/demo/live-activity.png',
          alt: 'ClipIRL Live Activity card on the lock screen',
          caption: 'The Live Activity always lets you know when ClipIRL is recording.',
        },
      ],
    },
  ],
  difficulties: [
    {
      title: 'drawing 14,000 bars',
      body: "The editor took about a month to get right, more time than anything else in the app. The first version was close to unusable. Zoomed all the way out on a long clip, it ran at around 5 frames a second, and opening one could freeze the screen outright. Profiling in Instruments put the time in view layout, thousands of bars being rebuilt over and over. Each bar of the waveform is its own SwiftUI view. A five minute clip at the default quality has about 14,000 source windows, the short audio slices the waveform is built from. The first editor drew all of them at once. So the editor stopped drawing source windows directly. A group of neighboring windows is averaged into one drawn bar, and the group size comes from the zoom level. One bar can stand for several hundred windows zoomed out, or only a few zoomed in. The bars also sit in a `LazyHStack`, so bars off screen are never built at all.",
      media: [
        {
          kind: 'pre',
          pre: `static func getLoudnessArr(indicesPerLine: Int) -> [Float] {
    var tempArr: [Float] = []
    for index in stride(from: 0, to: loudnessArr.count, by: indicesPerLine) {
        let height = findAverageLoudness(from: index, numOfIndexesPerLine: indicesPerLine)
        tempArr.append(height)
    }
    return tempArr
}`,
          caption: 'The zoom level sets indicesPerLine, the number of windows merged into one bar; the screen only ever gets the merged bars.',
        },
      ],
    },
    {
      title: 'pinning the layers',
      body: "The editor is not one view. The waveform, the timeline, the selection overlay, and the playhead all have to move together, and for a while they did not. Each layer tracked its own position, and small differences added up until the timeline sat visibly off from the waveform under it. I never fully traced every drift. The deeper problem was four positions that could disagree at all. The layers no longer own positions. They sit in a `ZStack`, and nothing in it actually scrolls. The waveform, timeline, and selection each move by the same offset, one number that every layer reads. The playhead stays fixed at screen center while everything slides underneath it. The offset goes through an `AnimatableModifier`, which lets SwiftUI animate the slide instead of jumping. Every visual layer ignores touches. The drag and the pinch both land on one invisible rectangle at the bottom of the stack, so a drag never depends on which layer happens to be under the finger.",
      media: [
        {
          kind: 'pre',
          pre: `struct OffsetModifier: AnimatableModifier {
    var offset: CGFloat

    var animatableData: CGFloat {
        get { offset }
        set { offset = newValue }
    }
    // ...
}

// waveform, timeline, and selection each move by this same offset
.modifier(OffsetModifier(offset: -1*offset + outOfBoundsOffset + screenWidth/2))`,
          caption: 'One offset moves every layer; the playhead stays fixed.',
        },
        {
          kind: 'pre',
          pre: `Rectangle()
    .frame(width: screenWidth, height: 350)
    .foregroundStyle(.clear)
    .contentShape(Rectangle())
    .gesture(
        DragGesture()
            .onChanged { value in
                updateDragGesture(value: value)
            }
    )
    .gesture(
        MagnifyGesture()
            .onChanged { value in
                updateMagnifyGesture(value: value)
            }
    )`,
          caption: 'An invisible full size rectangle behind every visual layer catches both gestures.',
        },
      ],
    },
    {
      title: 'keeping time in sync',
      body: "I caught this one testing by hand. Dragging the playhead to the very end of a clip left the time readout short of the clip's length. The timestamp and the offset were tracked as two separate numbers, and every drag, tick, and cut nudged them slightly apart. Now each action treats one of them as the source and derives the other from it. During playback the current time is the position where play started plus the wall clock time since. A 100 ms timer recomputes the offset from that time, so a late or dropped tick cannot drift the waveform away from the audio. Dragging goes the other way. The drag moves the offset, and the timestamp is derived from it. Drag updates that arrive within 50 ms of the last one are dropped.",
      media: [
        {
          kind: 'pre',
          pre: `// startScrolling()
let currTime: Date = Date()
let initialTimeStamp: Double = currTimeStamp
timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { _ in
    updateScroll(currTime: currTime, initialTimeStamp: initialTimeStamp)
}

// updateScroll()
let difference = Date().timeIntervalSince(currTime)
withAnimation {
    offset = (currTimeStamp/CGFloat(duration))*getLength()
}
currTimeStamp = initialTimeStamp+difference`,
          caption: 'Time comes from the wall clock; the offset is recomputed from it every tick.',
        },
      ],
    },
    {
      title: 'zooming',
      body: "Zooming was hard because everything changes at once. A pinch changes the zoom level, the zoom level changes how many windows merge into one bar, and the whole waveform changes width. Before the fix, a pinch teleported the view. The playhead landed on a different moment of audio after every zoom, with the timeline and selection out of place around it. So after a zoom the offset is rescaled by the ratio of new width to old width, and the moment under the playhead stays put. The timeline rebuilds too. Tick spacing depends on how many pixels one second covers at the current zoom, from half a second between ticks fully zoomed in to a minute zoomed out.",
      media: [
        {
          kind: 'pre',
          pre: `func postZoomUpdate() {
    offset = (offset/oldLength)*getLength()
    updateTimeLine()
    if (trimming) {
        updateHighlightedArea(useAnimation: false)
    }
}`,
          caption: 'The rescale that keeps the same audio under the playhead through a zoom.',
        },
      ],
    },
  ],
};

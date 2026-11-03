/* ==========================================================================
   THE SPECTRA BEHIND YOUR NAME on the home page.

   Each visit shows the next spectrum from SPECTRUM_ROTATION. The order is
   shuffled, and every spectrum in the list is shown once before any repeats
   (remembered per browser). To always show the same one, list just that one.
   Nothing on the page names the molecule; only the hover readout names peaks.

   Preview any of them: index.html?spectrum=caffeine

   Each spectrum
     nucleus    shown in the labels, e.g. "¹³C" or "¹H"
     decoupled  true for a ¹H-decoupled spectrum (the label reads ¹³C{¹H})
     window     [high, low] ppm range shown, high on the left as usual
     cycles     optional: how finely the strip resolves frequency (default 15).
                Raise it when peaks are close together compared with the
                window, so they separate (ethyl acetate needs 40). Higher
                values make the FID busier.
     peaks      ppm:    position
                height: relative height (tallest = 1)
                width:  line width in ppm (wider = broader peak, faster decay).
                        Keep it under about half the gap to the nearest peak.
                name:   optional, shown by the hover readout
   ========================================================================== */
window.SPECTRUM_ROTATION = ["ethanol", "ethylAcetate", "alanine", "caffeine", "deuterochloroform"];

window.SPECTRA = {
  // the original
  ethanol: {
    nucleus: "¹³C", decoupled: true, window: [88.2, -11.5],
    peaks: [
      { ppm: 58.3, height: 0.75, width: 4.9, name: "CH₂OH" },
      { ppm: 18.4, height: 1.0, width: 4.4, name: "CH₃" }
    ]
  },

  ethylAcetate: {
    nucleus: "¹³C", decoupled: true, window: [190, -10], cycles: 40,
    peaks: [
      { ppm: 171.1, height: 0.35, width: 3.5, name: "C=O" },
      { ppm: 60.5, height: 0.8, width: 3.5, name: "OCH₂" },
      { ppm: 21.0, height: 0.85, width: 3.5, name: "CH₃CO" },
      { ppm: 14.2, height: 1.0, width: 3.5, name: "CH₃" }
    ]
  },

  // L-alanine in D₂O: the three carbons every protein assignment starts from
  alanine: {
    nucleus: "¹³C", decoupled: true, window: [195, -5], cycles: 20,
    peaks: [
      { ppm: 176.5, height: 0.45, width: 5, name: "C′" },
      { ppm: 51.3, height: 0.9, width: 4.5, name: "Cα" },
      { ppm: 16.9, height: 1.0, width: 4.5, name: "Cβ" }
    ]
  },

  // caffeine in CDCl₃: one aromatic proton and three N-methyl singlets
  caffeine: {
    nucleus: "¹H", decoupled: false, window: [8.2, 2.8], cycles: 52,
    peaks: [
      { ppm: 7.52, height: 0.34, width: 0.1, name: "H8" },
      { ppm: 4.00, height: 1.0, width: 0.085, name: "N7–CH₃" },
      { ppm: 3.58, height: 1.0, width: 0.085, name: "N1–CH₃" },
      { ppm: 3.41, height: 1.0, width: 0.085, name: "N3–CH₃" }
    ]
  },

  // the solvent peak everyone has seen: CDCl₃, a 1:1:1 triplet from ¹³C–²H coupling
  deuterochloroform: {
    nucleus: "¹³C", decoupled: true, window: [79.2, 75.1], cycles: 24,
    peaks: [
      { ppm: 77.48, height: 1.0, width: 0.11, name: "C–D · 1:1:1 triplet" },
      { ppm: 77.16, height: 1.0, width: 0.11, name: "C–D · 1:1:1 triplet" },
      { ppm: 76.84, height: 1.0, width: 0.11, name: "C–D · 1:1:1 triplet" }
    ]
  }
};

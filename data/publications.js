/* ==========================================================================
   YOUR PUBLICATIONS, from your CV, Google Scholar and ORCID. Titles,
   journals, dates and DOIs were checked against Crossref. The figures are built-in animations standing in
   until you add your own (see "media" below, and anims/README.md).
   Order doesn't matter; the page sorts by year (then month) itself.

   Fields
     year       (required)  e.g. 2019
     month      (optional)  1–12, to order papers within a year
     title      (required)
     subtitle   (optional)  a one-line, plain-language summary
     subtitleEmphasis (optional) ordered phrases in the subtitle to italicize
     journal    (optional)
     authors    (optional)  your name (PUB_HIGHLIGHT below) is shown in bold
     doi        (optional)  e.g. "10.1038/s41586-020-1234-5"  (the title links to it)
     url        (optional)  link the title somewhere other than the DOI
     links      (optional)  extra links: [{ label: "PDF", href: "assets/pdf/x.pdf" }]
     id         (optional)  anchor for linking straight to a paper (publications.html#id)
     theme      (optional)  which row of the map it sits on: one of the keys in PUB_THEMES
     media      (optional)  one of:
                  { type: "image", src: "assets/pubs/fig.png", alt: "…" }
                  { type: "video", src: "assets/pubs/movie.mp4", poster: "…" }
                  { type: "animation", name: "precession" }   // built in, or your own: anims/<name>.js (anims/README.md)
                  { type: "embed", src: "https://…" }          // e.g. a Mol* viewer
                add  caption: "…"  to any of them, and  fit: "contain"  to stop cropping.
   ========================================================================== */
window.PUB_HIGHLIGHT = "Tolchard J";

// The research themes papers are grouped by, in the order they appear on the map.
window.PUB_THEMES = {
  "hyperpolarisation": "Hyperpolarisation",
  "solid-state": "Solid-state NMR",
  "solution": "Solution NMR",
  "data": "Data & infrastructure"
};

window.PUBLICATIONS = [
  {
    id: "jove-2017",
    theme: "solid-state",
    year: 2017, month: 9,
    title: "Atomic scale structural studies of macromolecular assemblies by solid-state nuclear magnetic resonance spectroscopy",
    subtitle: "A step-by-step protocol for studying large, insoluble protein assemblies at atomic resolution with magic-angle spinning NMR.",
    journal: "J. Vis. Exp. 127, e55779",
    authors: "Loquet A, Tolchard J, Berbon M, Martinez D, Habenstein B",
    doi: "10.3791/55779",
    media: { type: "animation", name: "rotor", alt: "Rotor spinning at the magic angle" }
  },
  {
    id: "tarp-2018",
    theme: "solution",
    year: 2018, month: 1,
    title: "The intrinsically disordered Tarp protein from chlamydia binds actin with a partially preformed helix",
    subtitle: "Tarp, an effector Chlamydia uses to remodel the host's actin, is largely disordered, but its actin-binding helix is partly formed before it binds.",
    journal: "Sci. Rep. 8, 1960",
    authors: "Tolchard J, Walpole SJ, Miles AJ, Maytum R, Eaglen LA, Hackstadt T, Wallace BA, Blumenschein TMA",
    doi: "10.1038/s41598-018-20290-8",
    media: { type: "animation", name: "tarp-2018", alt: "Tarp is a Chlamydia effector protein previously known to bind actin, with its binding mechanism unresolved. Its flexible 726–825 region appears first as a black chain, then G-actin appears beside it, asking how this disordered region binds. An expanded scene aligns the PONDR ordered-region prediction, a low-RCI flexibility trough, positive secondary Cα shifts, and enhanced slow/intermediate reduced spectral density at 500 and 800 MHz over the region of helical propensity around residues 746–759. The plots are approximate values read from the published figures. The two partners fade out before the evidence band appears. In the final scene, the HSQC sits beside actin, with a panel-wide chemical shift perturbation profile underneath. Small shifts and peak weakening connect to this residue profile and highlight the Tarp 746–767 binding region. Additional CSP measurements connect directly to the highlighted helix residues as the proposed complex forms. The structure annotation reports Kd = 102 nanomolar and a 1:1 interaction by ITC. One Tarp helix then docks at the cleft of one actin molecular surface derived from PDB 2A40 chain A; the pose remains illustrative. Molecular motion illustrates the states, not a measured binding pathway." }
  },
  {
    id: "jbnmr-2018",
    theme: "solid-state",
    year: 2018, month: 3,
    title: "Detection of side-chain proton resonances of fully protonated biosolids in nano-litre volumes by magic angle spinning solid-state NMR",
    subtitle: "Proton signals from protein side chains, recorded by solid-state NMR from a few nano-litres of fully protonated sample.",
    journal: "J. Biomol. NMR 70(3), 177–185",
    authors: "Tolchard J, Pandey MJ, Berbon M, Noubhani A, Saupe SJ, Nishiyama Y, Habenstein B, Loquet A",
    doi: "10.1007/s10858-018-0168-3",
    media: { type: "animation", name: "pulse", alt: "Cross-polarisation pulse sequence" }
  },
  {
    id: "salmonella-2019",
    theme: "solid-state",
    year: 2019, month: 7,
    title: "A polymorphic helix of a Salmonella needle protein relays signals defining distinct steps in type III secretion",
    subtitle: "Solid-state NMR and cryo-EM of the Salmonella injectisome needle show how one of its helices passes on the signals that move secretion from step to step.",
    journal: "PLOS Biol. 17(7), e3000351",
    authors: "Guo EZ, Desrosiers DC, Zalesak J, Tolchard J, Berbon M, Habenstein B, Marlovits T, Loquet A, Galán JE",
    doi: "10.1371/journal.pbio.3000351",
    media: { type: "animation", name: "rotor", alt: "Rotor spinning at the magic angle" }
  },
  {
    id: "somatostatin-2020",
    theme: "solution",
    year: 2020, month: 10,
    title: "Somatostatin, an in vivo binder to Aβ oligomers, binds to βPFOAβ(1–42) tetramers",
    subtitle: "The neuropeptide somatostatin binds a membrane-associated Aβ(1–42) tetramer but not monomeric Aβ; NMR chemical shift perturbations map where.",
    journal: "ACS Chem. Neurosci. 11(20), 3358–3365",
    authors: "Puig E, Tolchard J, Riera A, Carulla N",
    doi: "10.1021/acschemneuro.0c00470",
    media: { type: "animation", name: "somatostatin-2020", alt: "Somatostatin (SST14), a cyclic 14-residue neuropeptide, is shown in ball and stick beside the βPFO tetramer, a β-sheet pore-forming oligomer of Aβ(1–42) whose sides sit in a detergent micelle. Under the title that the two show a specific 2:1 interaction, native mass spectrometry shows the tetramer's peaks, then new peaks for the tetramer with one and two somatostatin bound; isothermal titration calorimetry shows shrinking heats of injection, each dropping to a point on a binding isotherm, whose fit gives a dissociation constant of about 39 micromolar and two somatostatin per tetramer. Then, in a close-up of the NMR spectrum, the peaks that shift as somatostatin is added show each titration step overlaid, from blue to red (the shifts slightly exaggerated), and are marked with red dots; matching red dots light up on the tetramer, in its micelle, at its two exposed ends, and one somatostatin docks at each end, with dashed lines to the nearest of them" }
  },
  {
    id: "cellfree-amyloid-2022",
    theme: "solid-state",
    year: 2022, month: 11,
    title: "Cell-free synthesis of amyloid fibrils with infectious properties and amenable to sub-milligram magic-angle spinning NMR analysis",
    subtitle: "Infectious HET-s prion fibrils assemble directly in a cell-free expression mix, with isotope labels that make sub-milligram MAS NMR possible.",
    journal: "Commun. Biol. 5, 1202",
    authors: "Lends A, Daskalov A, Maleckis A, Delamare A, Berbon M, Grélard A, Morvan E, Shenoy J, Dutour A, Tolchard J, Noubhani A, Giraud MF, Sanchez C, Habenstein B, Guichard G, Compain G, Jaudzems K, Saupe SJ, Loquet A",
    doi: "10.1038/s42003-022-04175-1",
    media: { type: "animation", name: "cellfree-amyloid-2022", alt: "A dialysis bag of cell-free reaction mix sits in its feeding mixture. The plasmid carrying the HET-s gene and E. coli ribosomes go into the bag, with NTPs, salts and co-factors, and ¹³C,¹⁵N-labelled glycine, valine and isoleucine go into the feeding mixture for selective labelling; over 18 hours HET-s chains are made at the ribosomes and each folds into a kinked layer of a straight fibril. The fibrils are spun down into a white pellet, washed with water and about half a milligram packed into a 0.7 mm rotor. The rotor tilts to the magic angle and spins at 100 kHz while a 2D hNH spectrum builds: the reference from recombinant fibrils labelled throughout in orange, then the cell-free sample's 16 labelled glycine, valine and isoleucine peaks in blue, each landing on its orange partner" }
  },
  {
    id: "aspergillus-2023",
    theme: "solid-state",
    year: 2023, month: 2,
    title: "Solid-state NMR molecular snapshots of Aspergillus fumigatus cell wall architecture during a conidial morphotype transition",
    subtitle: "Magic-angle spinning NMR follows how the cell wall polysaccharides of Aspergillus fumigatus spores rearrange as they germinate.",
    journal: "Proc. Natl. Acad. Sci. U.S.A. 120(6), e2212003120",
    authors: "Lamon G, Lends A, Valsecchi I, Wong SSW, Duprès V, Lafont F, Tolchard J, Schmitt C, Mallet A, Grélard A, Morvan E, Dufourc EJ, Habenstein B, Guijarro JI, Aimanianda V, Loquet A",
    doi: "10.1073/pnas.2212003120",
    media: { type: "animation", name: "aspergillus-2023", alt: "The cell wall of an Aspergillus fumigatus spore in section, from dormant to swollen to germinating: its coat of rodlets on melanin breaks away, its rows of β-glucan (orange) and α-glucan (blue) beads re-balance at each stage while a row of chitin stays the same, and strands of galactosaminogalactan appear on germination. Below, a stylised ¹³C MAS NMR spectrum of the rigid wall shows the same change: the glucan peaks shift from 67/21 % to 47/41 % and back to 63/25 % while chitin holds at 12 %; each stage's spectrum is drawn in its own colour (dormant grey, swollen red, germinating green, as on the stage track) and kept as the next appears, and the peaks of mobile galactosaminogalactan, from a separate experiment on the same spores, rise on germination" }
  },
  {
    id: "restraint-validation-2024",
    theme: "data",
    year: 2024, month: 6,
    title: "Restraint validation of biomolecular structures determined by NMR in the Protein Data Bank",
    subtitle: "Improving how the experimental restraints behind NMR structures in the Protein Data Bank are validated.",
    journal: "Structure 32(6), 824–837",
    authors: "Baskaran K, Ploskon E, Tejero R, Yokochi M, Harrus D, Liang Y, Peisach E, Persikova I, Ramelot TA, Sekharan M, Tolchard J, Westbrook JD, Bardiaux B, Schwieters CD, Patwardhan A, Velankar S, Burley SK, Kurisu G, Hoch JC, Montelione GT",
    doi: "10.1016/j.str.2024.02.011",
    media: { type: "animation", name: "restraint-validation-2024", alt: "Restraint files in the community formats (CYANA, Xplor-NIH, ARIA, NEF) deposited through OneDep as one NMR-STAR file, a copy archived at the BMRB; each restraint then checked against the model (green satisfied, orange small violations, red large), the restraint counts shown by category, and knowledge-based checks (Ramachandran outliers, clashes, bond lengths, chemical shifts) filling the percentile sliders, all ending in a wwPDB validation report" }
  },
  {
    id: "avr3a11-2025",
    theme: "solution",
    year: 2025, month: 3,
    title: "Dynamics in the Phytophthora capsici effector AVR3a11 confirm the core WY domain fold",
    subtitle: "The NMR solution structure and dynamics of AVR3a11, an effector from a plant pathogen, support the three-helix WY domain as its core fold.",
    journal: "Biochemistry 64(5), 1146–1156",
    authors: "Tolchard J, Chambers VS, Boutemy LS, Banfield MJ, Blumenschein TMA",
    doi: "10.1021/acs.biochem.4c00660",
    links: [{ label: "PDB ↗", href: "https://www.ebi.ac.uk/pdbe/entry/pdb/3zgk" }],
    media: { type: "animation", name: "avr3a11-2025", alt: "AVR3a11's NMR structure built from NOE and dihedral restraints into an ensemble of 20 models, then its dynamics with per-residue data on three timescales: ps–ns relaxation is uniform; ms–s exchange singles out the N-terminus and loop 3; H/D exchange protection marks helices II–IV, the WY domain, as the stable core" }
  },
  {
    id: "ddnp-batteries-2025",
    theme: "hyperpolarisation",
    year: 2025, month: 6,
    title: "Hyperpolarized ¹³C NMR by dissolution DNP enables snapshot detection of degradation products in lithium-ion battery electrolytes",
    subtitle: "Dissolution DNP raises ¹³C sensitivity enough to catch the degradation products of lithium-ion battery electrolytes in a single snapshot.",
    journal: "J. Am. Chem. Soc. 147(22), 19039–19051",
    authors: "Gioiosa C, Pokochueva EV, Dieterich J, Tolchard J, Bocquelet C, Ennachet MA, Le NH, Veyre L, Montarnal D, Lesage A, Laage S, Pondaven S, Jannin S",
    doi: "10.1021/jacs.5c03773",
    media: { type: "animation", name: "ddnp-batteries-2025", alt: "A battery cracks open like an egg and a drop of its electrolyte falls into a sample cup, which goes down into a polariser, freezes at 1.6 K and is hyperpolarised by microwaves; solvent heated to about 430 K then melts it and pushes it along a transfer line into an NMR magnet, which records a high signal-to-noise carbon-13 spectrum." }
  },
  {
    id: "calcitonin-2017",
    theme: "solid-state",
    year: 2017, month: 7,
    title: "Structural biology of calcitonin: from aqueous therapeutic properties to amyloid aggregation",
    subtitle: "A review of calcitonin's structural biology, from the hormone's therapeutic properties in solution to its aggregation into amyloid fibrils.",
    journal: "Isr. J. Chem. 57(7–8), 634–650",
    authors: "Kamgar-Parsi K, Tolchard J, Habenstein B, Loquet A, Naito A, Ramamoorthy A",
    doi: "10.1002/ijch.201600096"
  },
  {
    id: "cellfree-atpase-2017",
    theme: "solution",
    year: 2017, month: 6,
    title: "Cell-free expression for the study of hydrophobic proteins: the example of yeast ATP-synthase subunits",
    subtitle: "A methods chapter on producing the small hydrophobic subunits of yeast ATP synthase in milligram amounts by cell-free expression.",
    journal: "Methods Mol. Biol., 57–90",
    authors: "Larrieu I, Tolchard J, Sanchez C, Kone EY, Barras A, Stines-Chaumeil C, Odaert B, Giraud MF",
    doi: "10.1007/978-1-4939-7151-0_4"
  },
  {
    id: "rgd1-2017",
    theme: "solution",
    year: 2017, month: 10,
    title: "Structural evidence of a phosphoinositide-binding site in the Rgd1-RhoGAP domain",
    subtitle: "The RhoGAP domain of the yeast GTPase-activating protein Rgd1 has its own binding site for phosphoinositide lipids.",
    journal: "Biochem. J. 474(19), 3307–3319",
    authors: "Martinez D, Langlois d'Estaintot B, Granier T, Tolchard J, Courrèges C, Prouzet-Mauléon V, Hugues M, Gallois B, Doignon F, Odaert B",
    doi: "10.1042/bcj20170331",
    media: { type: "animation", name: "contour", alt: "2D spectrum appearing as increments are acquired" }
  },
  {
    id: "leucocyanidin-2018",
    theme: "solution",
    year: 2018, month: 1,
    title: "Production of 3,4-cis- and 3,4-trans-leucocyanidin and their distinct MS/MS fragmentation patterns",
    subtitle: "Producing the 3,4-cis and 3,4-trans stereoisomers of leucocyanidin, with NMR confirming their structures and MS/MS telling them apart.",
    journal: "J. Agric. Food Chem. 66(1), 351–358",
    authors: "Zhang JR, Tolchard J, Bathany K, Langlois d'Estaintot B, Chaudiere J",
    doi: "10.1021/acs.jafc.7b04380"
  },
  {
    id: "abeta-oligomer-2018",
    theme: "solution",
    year: 2018, month: 4,
    title: "Stabilization of a membrane-associated amyloid-β oligomer for its validation in Alzheimer's disease",
    subtitle: "Stabilising a pore-forming Aβ42 oligomer, first prepared in detergent micelles, so that its relevance to Alzheimer's disease can be tested.",
    journal: "Front. Mol. Biosci. 5, 38",
    authors: "Serra-Batiste M, Tolchard J, Giusti F, Zoonens M, Carulla N",
    doi: "10.3389/fmolb.2018.00038"
  },
  {
    id: "bacillus-biofilms-2019",
    theme: "solid-state",
    year: 2019, month: 11,
    title: "Molecular architecture of bacterial amyloids in Bacillus biofilms",
    subtitle: "Solid-state NMR, electron microscopy and other methods reveal the molecular architecture of the functional amyloids in Bacillus biofilms.",
    journal: "FASEB J. 33(11), 12146–12163",
    authors: "El Mammeri N, Hierrezuelo J, Tolchard J, Cámara-Almirón J, Caro-Astorga J, Álvarez-Mena A, Dutour A, Berbon M, Shenoy J, Morvan E, Grélard A, Kauffmann B, Lecomte S, de Vicente A, Habenstein B, Romero D, Loquet A",
    doi: "10.1096/fj.201900831r",
    media: { type: "animation", name: "rotor", alt: "Rotor spinning at the magic angle" }
  },
  {
    id: "pseudomonas-t3ss-2019",
    theme: "solid-state",
    year: 2019, month: 3,
    title: "Structural and functional characterization of the type three secretion system (T3SS) needle of Pseudomonas aeruginosa",
    subtitle: "In vivo, in vitro, and in silico characterisation of the Pseudomonas aeruginosa type III secretion needle and its main building block.",
    subtitleEmphasis: ["In vivo", "in vitro", "in silico"],
    journal: "Front. Microbiol. 10, 573",
    authors: "Lombardi C, Tolchard J, Bouillot S, Signor L, Gebus C, Liebl D, Fenel D, Teulon JM, Brock J, Habenstein B, Pellequer JL, Faudry E, Loquet A, Attrée I, Dessen A, Job V",
    doi: "10.3389/fmicb.2019.00573"
  },
  {
    id: "smad7-wwp2-2019",
    theme: "solution",
    year: 2019, month: 9,
    title: "Smad7 binds differently to individual and tandem WW3 and WW4 domains of WWP2 ubiquitin ligase isoforms",
    subtitle: "The inhibitor Smad7 binds differently to the single and tandem WW3 and WW4 domains of the ubiquitin ligase WWP2.",
    journal: "Int. J. Mol. Sci. 20(19), 4682",
    authors: "Wahl LC, Watt JE, Yim HTT, De Bourcier D, Tolchard J, Soond SM, Blumenschein TMA, Chantry A",
    doi: "10.3390/ijms20194682",
    links: [{ label: "PDB ↗", href: "https://www.ebi.ac.uk/pdbe/entry/pdb/6rss" }],
    media: { type: "animation", name: "smad7-wwp2-2019", alt: "Human WWP2, an E3 ligase, tags Smad7, an inhibitor of TGFβ signalling, for destruction; NMR titrations then show WW3 binding Smad7 seven times more tightly next to WW4 (Kd 139 µM alone, 21 µM in tandem) while WW4 barely changes; WW4's NMR structure (PDB 6RSS) shows where Smad7 binds; and the newly found isoform WWP2C-ΔHECT, with both domains but no working HECT, may protect Smad7 rather than destroy it." }
  },
  {
    id: "assemblies-chapter-2019",
    theme: "solid-state",
    year: 2019, month: 4,
    title: "Atomic structural investigations of self-assembled protein complexes by solid-state NMR",
    subtitle: "A review of how solid-state NMR solves the atomic structures of self-assembled protein complexes.",
    journal: "Applications of NMR Spectroscopy, vol. 7, 1–39",
    authors: "Loquet A, Tolchard J, Habenstein B",
    doi: "10.2174/9781681086415118070003"
  },
  {
    id: "t3ss-needles-chapter-2020",
    theme: "solid-state",
    year: 2020, month: 1,
    title: "Structures of type III secretion system needle filaments",
    subtitle: "A review of the structures of type III secretion needle filaments, the hollow protein tubes bacteria use to inject proteins into host cells.",
    journal: "Curr. Top. Microbiol. Immunol., 109–131",
    authors: "Habenstein B, El Mammeri N, Tolchard J, Lamon G, Tawani A, Berbon M, Loquet A",
    doi: "10.1007/82_2019_192"
  },
  {
    id: "pdbe-nar-2020",
    theme: "data",
    year: 2020, month: 1,
    title: "PDBe: improved findability of macromolecular structure data in the PDB",
    subtitle: "How PDBe enriches PDB data and makes macromolecular structures easier to find, access and analyse.",
    journal: "Nucleic Acids Res. 48(D1), D335–D343",
    authors: "Armstrong DR, Berrisford JM, Conroy MJ, Gutmanas A, Anyango S, Choudhary P, Clark AR, Dana JM, Deshpande M, Dunlop R, Gane P, Gáborová R, Gupta D, Haslam P, Koča J, Mak L, Mir S, Mukhopadhyay A, Nadzirin N, Nair S, Paysan-Lafosse T, Pravda L, Sehnal D, Salih O, Smart O, Tolchard J, Varadi M, Svobodova-Vařeková R, Zaki H, Kleywegt GJ, Velankar S",
    doi: "10.1093/nar/gkz990",
    media: { type: "animation", name: "pdbe-nar-2020", alt: "A search on PDBe, step by step. The archive's 155,000+ entries appear as a field of dots. Typing \"cytochrome\" into the advanced search form's molecule name field brings up autocomplete terms with their entry counts; picking cytochrome c peroxidase, mitochondrial pulls its 180 entries out of the archive as squares. Two more fields joined with AND narrow them: experimental method X-ray diffraction (177), then a resolution limit sliding from 3.1 to 1.5 Å, with each entry dropping out as the limit passes its own resolution (42 left). Sequence clustering then groups near-identical sequences: 7 clusters at 100 % identity, 2 at 95 % and 1 at 90 %, each shown by one representative in orange with the rest hidden. The last representative, PDB entry 3e2n, opens as a result card with its method and 1.30 Å resolution, its bound haem cofactor, its Pfam domain, its PDBe-KB link, buttons for the 3D view and downloads, and its own structure turning in 3D as a ribbon cartoon with the haem" }
  },
  {
    id: "bolaamphiphile-gels-2021",
    theme: "solution",
    year: 2021, month: 7,
    title: "Bolaamphiphile-based supramolecular gels with drugs eliciting membrane effects",
    subtitle: "A low-molecular-weight bolaamphiphile gel that triggers cancer-cell death through its interactions with cell membranes.",
    journal: "J. Colloid Interface Sci. 594, 857–863",
    authors: "Latxague L, Benizri S, Gaubert A, Tolchard J, Martinez D, Morvan E, Grélard A, Saad A, Habenstein B, Loquet A, Barthélémy P",
    doi: "10.1016/j.jcis.2021.03.026",
    media: { type: "animation", name: "bolaamphiphile-gels-2021", alt: "The chemical structure of GNBA-F appears, its two glucose–thymidine heads in blue and its fluorinated core in green, then squeezes into a simple dumbbell: two blue heads (16 Å each) on a rigid green core (20 Å). It then joins many others assembling into the nanofibres of a supramolecular gel, while a plot shows its fluorine-19 solution NMR signal fading to nothing over about 7 hours as the molecules lock into the gel. At 37 °C a few single molecules leave the gel, drift down to a cell membrane and slide in, each spanning the lipid bilayer, and the membrane is disrupted. A second plot shows the lipids' carbon-13 solid-state NMR signal falling to about half over 16 hours. Finally the membrane blebs as the cancer cells die" }
  },
  {
    id: "pdbe-kb-2022",
    theme: "data",
    year: 2022, month: 10,
    title: "PDBe and PDBe-KB: providing high-quality, up-to-date and integrated resources of macromolecular structures to support basic and applied research and education",
    subtitle: "An overview of the databases and web services that PDBe and PDBe-KB provide for macromolecular structure data, for research and teaching.",
    journal: "Protein Sci. 31(10), e4439",
    authors: "Varadi M, Anyango S, Appasamy SD, Armstrong D, Bage M, Berrisford J, Choudhary P, Bertoni D, Deshpande M, Leines GD, Ellaway J, Evans G, Gaborova R, Gupta D, Gutmanas A, Harrus D, Kleywegt GJ, Bueno WM, Nadzirin N, Nair S, Pravda L, Afonso MQL, Sehnal D, Tanweer A, Tolchard J, Abrams C, Dunlop R, Velankar S",
    doi: "10.1002/pro.4439",
    media: { type: "animation", name: "pdbe-kb-2022", alt: "The PDBe infrastructure as in the paper's Figure 1: structures from depositors worldwide pass through the wwPDB's OneDep system, drawn as a train of turning gears; PDBe-KB partners drop in residue-level annotation files (over 80 million annotations for over 185,000 entries), which enrich each entry before it goes into PDBe's databases; then APIs (over 90 endpoints) send the data out to PDBe's entry pages and PDBe-KB's aggregated views of proteins, ligands and complexes. Finally, as in Figure 3, one entry page opens up: 1KPA, the human HINT1 dimer, with its sequence-feature tracks, topology diagram and 3D structure. A cursor moves along the tracks to lysine 92, which lies in the interface track and has a known variant, and the same residue lights up in a loop of the topology and at the dimer interface in 3D" }
  },
  {
    id: "modelcif-2023",
    theme: "data",
    year: 2023, month: 7,
    title: "ModelCIF: an extension of PDBx/mmCIF data representation for computed structure models",
    subtitle: "ModelCIF, the data standard for depositing, archiving and sharing computationally predicted structure models.",
    journal: "J. Mol. Biol. 435(14), 168021",
    authors: "Vallat B, Tauriello G, Bienert S, Haas J, Webb BM, Žídek A, Zheng W, Peisach E, Piehl DW, Anischanka I, Sillitoe I, Tolchard J, Varadi M, Baker D, Orengo C, Zhang Y, Hoch JC, Kurisu G, Patwardhan A, Velankar S, Burley SK, Sali A, Schwede T, Berman HM, Westbrook JD",
    doi: "10.1016/j.jmb.2023.168021",
    media: { type: "animation", name: "modelcif-2023", alt: "A structure file's card: first the sections the PDB's PDBx/mmCIF format already has (coordinates, molecules, software and authors), beside a computed model; then the sections ModelCIF adds, each with a picture of what it holds: the target–template alignment, the modelling steps, linked files such as MSAs, and model quality, where the model colours by its per-residue confidence (pLDDT) and its pair-error (PAE) map builds" }
  },
  {
    id: "sifts-2023",
    theme: "data",
    year: 2023, month: 4,
    title: "Unified access to up-to-date residue-level annotations from UniProtKB and other biological databases for PDB data",
    subtitle: "Residue-level annotations from UniProtKB and other resources, made available directly within PDB structure files through SIFTS.",
    journal: "Sci. Data 10, 204",
    authors: "Choudhary P, Anyango S, Berrisford J, Tolchard J, Varadi M, Velankar S",
    doi: "10.1038/s41597-023-02101-6",
    media: { type: "animation", name: "sifts-2023", alt: "A protein's UniProtKB sequence above several PDB entries of it, each a fragment numbered its own way (one with an expression tag, one with a loop not modelled), so the same tryptophan is W155 in one and W140 in another. SIFTS maps each entry onto the sequence: the entries slide into place, their numbers become UniProtKB numbers and both tryptophans become W179; CATH domains, a parent domain split in two by an inserted one, then carry down onto every entry. Finally the rows move up and the fullest entry turns in 3D below, coloured by the same domains, with the inserted domain sitting between the parent's two parts" }
  },
  {
    id: "pdb-drug-design-2024",
    theme: "data",
    year: 2024, month: 2,
    title: "The Protein Data Bank (PDB) and macromolecular structure data supporting computer-aided drug design",
    subtitle: "An introduction to the data in the PDB, how it is organised and curated, and how it supports computer-aided drug design.",
    journal: "Open Access Databases and Datasets for Drug Discovery (Wiley), 139–173",
    authors: "Armstrong D, Berrisford J, Choudhary P, Pravda L, Tolchard J, Varadi M, Velankar S",
    doi: "10.1002/9783527830497.ch5",
    media: { type: "animation", name: "pdb-drug-design-2024", alt: "A wall of small tiles fills in, each a structure from the PDB's 200,000-plus: proteins as blue blobs, DNA and RNA in green. The ones with a small molecule bound light up, their ligands orange. One opens up into a protein's binding pocket: a drug settles into it and its contacts appear, two hydrogen bonds and a hydrophobic contact. Then, for computer-aided drug design, a new green group grows from the drug into an empty sub-pocket and makes a new contact" }
  },
  {
    id: "hypso-pores-2025",
    theme: "hyperpolarisation",
    year: 2025, month: 6,
    title: "Hybrid polarizing solids with extended pore diameters for dissolution dynamic nuclear polarization",
    subtitle: "Porous hybrid polarizing solids hyperpolarise samples for dissolution DNP without leaving the polarizing agent in the solution. This generation with wider pores decreases hyperpolarization losses upon melting, transfer, and filtration.",
    journal: "Chemistry–Methods 5(6), e202400068",
    authors: "Pokochueva EV, Le NH, Guibert S, Gioiosa C, Stern Q, Tolchard J, Bocquelet C, Cala O, Cavaillès M, Veyre L, Mankinen O, Telkki V, Thieuleux C, Jannin S",
    doi: "10.1002/cmtd.202400068",
    media: { type: "animation", name: "hypso-pores-2025", alt: "A pore through a HYPSO silica sphere, its walls lined with TEMPO radicals: microwaves and cross polarisation hyperpolarise the acetate inside, then hot D₂O melts it and the molecules leave, those near the walls relaxing on the way. 4 nm pores start more polarised but lose about half; 28 nm pores lose about a quarter, so both arrive with the same ¹³C polarisation, with half the TEMPO" }
  },
  {
    id: "remote-nmr-2026",
    theme: "data",
    year: 2026, month: 4,
    title: "Moving NMR infrastructures to remote access capabilities",
    subtitle: "A review of the challenges and opportunities in opening NMR facilities to remote access, a shift accelerated by the COVID-19 pandemic.",
    journal: "Prog. Nucl. Magn. Reson. Spectrosc. 152–153, 101595",
    authors: "Tolchard J, Le Marchand T, Aspers RLEG, Batta G, Bechinger B, Brath U, Chasapi SA, Čikoš A, Ecsedi K, Favier A, Ferreira ASD, Fiala R, Georgiopoulou PD, Gómez JS, Jaudzems K, Karlsson G, Kentgens APM, Lambregts SFH, Morelli F, Mulder FAA, Natarajan SV, Persson C, Pierattelli R, Pons M, Raya J, Redfield C, Smrečki V, Spyroulias GA, Trébosc J, Vallet A, van Heijenoort C, van Ingen H, Vosegaard T, Wirmer-Bartoschek J, Schwalbe H, Lesage A, Pintacuda G",
    doi: "10.1016/j.pnmrs.2026.101595",
    media: { type: "animation", name: "remote-nmr-2026", alt: "A sample tube is driven by truck from the user's lab to a distant NMR facility, passes a safety check and goes into the magnet; the user's commands travel to the spectrometer over the network, and the recorded signal travels back to the user's laptop, where it becomes a spectrum." }
  },
  {
    id: "proton-dnp-2026",
    theme: "hyperpolarisation",
    year: 2026, month: 8,
    title: "Preserving proton resolution under cryogenic dynamic nuclear polarization for biomolecular solid-state NMR",
    subtitle: "High-resolution proton-detected magic-angle spinning NMR of proteins under cryogenic DNP, combining proton detection with large signal enhancements.",
    journal: "Angew. Chem. Int. Ed., e3761769",
    authors: "Tolchard J, Le Marchand T, El Mammeri N, Sharma K, Bishoyi AK, Berbon M, Jaudzems K, Wisser D, Daskalov A, Saupe SJ, Stanek J, Sun Z, Ouari O, Habenstein B, Lesage A, Pintacuda G, Loquet A",
    doi: "10.1002/anie.3761769",
    media: { type: "animation", name: "proton-dnp-2026", alt: "A fibril strand dense with coupled protons gives a somewhat broad ¹H spectrum at 298 K and 12 kHz spinning, which broadens on cooling to 100 K. Spin dilution with ¹³CHD₂ methyls and then 40 kHz spinning resolve it; adding the DNP biradical broadens the peaks, and switching on the microwaves lifts the signal far above the noise. Finally, two peaks are joined by a correlation, and the distance between the two methyl protons behind it appears." }
  }
];

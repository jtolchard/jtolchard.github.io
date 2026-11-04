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
    media: { type: "animation", name: "contour", alt: "2D spectrum appearing as increments are acquired" }
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
    media: { type: "animation", name: "contour", alt: "2D spectrum appearing as increments are acquired" }
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
    media: { type: "animation", name: "rotor", alt: "Rotor spinning at the magic angle" }
  },
  {
    id: "aspergillus-2023",
    theme: "solid-state",
    year: 2023, month: 2,
    title: "Solid-state NMR molecular snapshots of Aspergillus fumigatus cell wall architecture during a conidial morphotype transition",
    subtitle: "Magic-angle spinning NMR follows how the cell wall polysaccharides of Aspergillus fumigatus spores rearrange as they germinate.",
    journal: "Proc. Natl. Acad. Sci. U.S.A. 120(6), e2212003120",
    authors: "Lamon G, Lends A, Valsecchi I, Sze S, Wong W, Duprès V, Lafont F, Tolchard J, Schmitt C, Mallet C, Mallet A, Grélard A, Morvan E, Dufourc EJ, Habenstein B, Guijarro JI, Aimanianda V, Loquet A",
    doi: "10.1073/pnas.2212003120",
    media: { type: "animation", name: "pulse", alt: "Cross-polarisation pulse sequence" }
  },
  {
    id: "restraint-validation-2024",
    theme: "data",
    year: 2024, month: 6,
    title: "Restraint validation of biomolecular structures determined by NMR in the Protein Data Bank",
    subtitle: "How the experimental restraints behind NMR structures in the Protein Data Bank are validated.",
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
    subtitle: "The solution structure and dynamics of AVR3a11, an effector from a plant pathogen, support the three-helix WY domain as its core fold.",
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
    subtitle: "In vivo, in vitro and in silico characterisation of the Pseudomonas aeruginosa type III secretion needle and its main building block.",
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
    media: { type: "animation", name: "contour", alt: "2D spectrum appearing as increments are acquired" }
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
    doi: "10.1093/nar/gkz990"
  },
  {
    id: "bolaamphiphile-gels-2021",
    theme: "solution",
    year: 2021, month: 7,
    title: "Bolaamphiphile-based supramolecular gels with drugs eliciting membrane effects",
    subtitle: "A low-molecular-weight bolaamphiphile gel that triggers cancer-cell death through its interactions with cell membranes.",
    journal: "J. Colloid Interface Sci. 594, 857–863",
    authors: "Latxague L, Benizri S, Gaubert A, Tolchard J, Martinez D, Morvan E, Grélard A, Saad A, Habenstein B, Loquet A, Barthélémy P",
    doi: "10.1016/j.jcis.2021.03.026"
  },
  {
    id: "pdbe-kb-2022",
    theme: "data",
    year: 2022, month: 10,
    title: "PDBe and PDBe-KB: providing high-quality, up-to-date and integrated resources of macromolecular structures to support basic and applied research and education",
    subtitle: "An overview of the databases and web services that PDBe and PDBe-KB provide for macromolecular structure data, for research and teaching.",
    journal: "Protein Sci. 31(10), e4439",
    authors: "Varadi M, Anyango S, Appasamy SD, Armstrong D, Bage M, Berrisford J, Choudhary P, Bertoni D, Deshpande M, Leines GD, Ellaway J, Evans G, Gaborova R, Gupta D, Gutmanas A, Harrus D, Kleywegt GJ, Bueno WM, Nadzirin N, Nair S, Pravda L, Afonso MQL, Sehnal D, Tanweer A, Tolchard J, Abrams C, Dunlop R, Velankar S",
    doi: "10.1002/pro.4439"
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
    doi: "10.1038/s41597-023-02101-6"
  },
  {
    id: "pdb-drug-design-2024",
    theme: "data",
    year: 2024, month: 2,
    title: "The Protein Data Bank (PDB) and macromolecular structure data supporting computer-aided drug design",
    subtitle: "An introduction to the data in the PDB, how it is organised and curated, and how it supports computer-aided drug design.",
    journal: "Open Access Databases and Datasets for Drug Discovery (Wiley), 139–173",
    authors: "Armstrong D, Berrisford J, Choudhary P, Pravda L, Tolchard J, Varadi M, Velankar S",
    doi: "10.1002/9783527830497.ch5"
  },
  {
    id: "hypso-pores-2025",
    theme: "hyperpolarisation",
    year: 2025, month: 6,
    title: "Hybrid polarizing solids with extended pore diameters for dissolution dynamic nuclear polarization",
    subtitle: "Porous hybrid polarizing solids, now with wider pores, that hyperpolarise samples for dissolution DNP without leaving the polarizing agent in the solution.",
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

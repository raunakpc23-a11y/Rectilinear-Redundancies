// cards3.js - chapter-tagged flashcards (P=Physics C=Chemistry M=Maths). Load after cards2.js.
// Appends rows [code, question, answer, chapter] to window.flashSeed (the core deck ignores the 4th field, flashplus.js uses it).
(function () {
const D = {
P: {
"Units & Dimensions": [
["Dimensions of force, pressure, work, power","Force MLT⁻²; pressure/stress/Young's modulus ML⁻¹T⁻²; work/energy/torque ML²T⁻²; power ML²T⁻³"],
["Dimensions of momentum, impulse, angular momentum","Momentum and impulse MLT⁻¹; angular momentum and Planck's constant ML²T⁻¹"],
["Dimensions of surface tension, spring constant, viscosity","Surface tension and spring constant MT⁻²; coefficient of viscosity ML⁻¹T⁻¹"],
["Quantities with dimension T⁻¹","Frequency, angular velocity, decay constant, velocity gradient, 1/RC, R/L"],
["Dimensions of specific heat, latent heat, R, Boltzmann constant","Specific heat L²T⁻²K⁻¹; latent heat L²T⁻²; R ML²T⁻²K⁻¹mol⁻¹; k_B ML²T⁻²K⁻¹ (same as entropy)"],
["Dimensions of charge, capacitance, resistance, inductance","Charge AT; capacitance M⁻¹L⁻²T⁴A²; resistance ML²T⁻³A⁻²; inductance ML²T⁻²A⁻²"],
["Dimensions of E, V, B and magnetic flux","E: MLT⁻³A⁻¹; V: ML²T⁻³A⁻¹; B: MT⁻²A⁻¹; flux: ML²T⁻²A⁻¹"],
["Dimensions of Stefan's constant and Wien's constant","σ: MT⁻³K⁻⁴; b: LK"],
["Dimensions of gravitational potential and field intensity","Potential L²T⁻²; field intensity LT⁻²"],
["Principle of homogeneity","Only quantities of the same dimensions can be added, subtracted or equated; every term in a valid equation has the same dimensions"],
["Dimensionless quantities (examples)","Strain, refractive index, angle (rad), solid angle (sr), relative density, Reynolds number, arguments of sin/exp/log"],
["Combinations with dimensions of velocity","E/B, 1/√(μ₀ε₀), √(P/ρ), √(T/μ), √(γRT/M), √(gl)"],
["Combinations with dimensions of time","L/R, RC, √(LC), √(l/g), √(m/k)"],
["Dimensions of ε₀E² and B²/μ₀","Both are energy density: ML⁻¹T⁻²"],
["Torque versus work","Same dimensions ML²T⁻², but torque is a vector (r × F) and work is a scalar"],
["Seven SI base units","metre, kilogram, second, ampere, kelvin, mole, candela"],
["Limitations of dimensional analysis","Cannot give dimensionless constants (½, 2π), cannot handle sin/exp/log forms or sums of terms, and cannot say whether a relation is complete"],
["Error in a sum or difference","Absolute errors add: Δ(A ± B) = ΔA + ΔB"],
["Percentage error in x = a²b³/c","(Δx/x)×100 = 2(Δa/a)×100 + 3(Δb/b)×100 + (Δc/c)×100"],
["Significant figure rules","Non-zero digits count; zeros between digits count; leading zeros do not; trailing zeros count only after a decimal point. 0.0230 has 3"],
["Rounding in calculations","Product/quotient: least number of significant figures. Sum/difference: least number of decimal places"],
["Unit conversions: dyne, erg, atm, eV","1 dyne = 10⁻⁵ N; 1 erg = 10⁻⁷ J; 1 atm = 1.013×10⁵ Pa; 1 eV = 1.6×10⁻¹⁹ J"],
["Astronomical length units","1 light year = 9.46×10¹⁵ m; 1 parsec = 3.26 ly = 3.08×10¹⁶ m; 1 AU = 1.5×10¹¹ m"],
["Atomic mass unit, angstrom, fermi","1 u = 1.66×10⁻²⁷ kg ≈ 931.5 MeV/c²; 1 Å = 10⁻¹⁰ m; 1 fermi = 10⁻¹⁵ m"]
],
"Kinematics": [
["Area under v–t and a–t graphs","Area under v–t = displacement; area under a–t = change in velocity; slope of x–t = velocity; slope of v–t = acceleration"],
["Distance in the nth second","s_n = u + a(n − ½)"],
["Relative velocity in 2-D","v_AB = v_A − v_B; magnitude √(v_A² + v_B² − 2v_Av_B cosθ) with θ between them"],
["Boat crossing a river","Shortest time: head perpendicular, t = d/v_b. Shortest path: sinθ = v_r/v_b upstream of the normal (needs v_b > v_r)"],
["Rain and umbrella problem","v_rm = v_r − v_m; tilt from vertical tanα = v_m/v_r"],
["Trajectory of a projectile","y = x tanθ − g x²/(2u² cos²θ), a parabola"],
["Range for complementary angles","θ and 90° − θ give the same range; maximum at 45°, R_max = u²/g"],
["Vertical motion under gravity","H = u²/2g; time to top = u/g; returns with the launch speed (no drag)"],
["Horizontal projectile from height h","t = √(2h/g); range = u√(2h/g); final speed √(u² + 2gh)"],
["Average speed for two equal distances","2v₁v₂/(v₁ + v₂) (harmonic mean). For equal times it is (v₁ + v₂)/2"],
["Acceleration as a function of position","a = v dv/dx; integrate v dv = a dx"]
],
"Laws of Motion": [
["Block on a rough incline","a = g(sinθ − μ cosθ) sliding down; N = mg cosθ"],
["Atwood machine","a = (m₁ − m₂)g/(m₁ + m₂); T = 2m₁m₂g/(m₁ + m₂)"],
["Block on smooth table pulled by hanging mass","a = m₂g/(m₁ + m₂); T = m₁m₂g/(m₁ + m₂)"],
["Apparent weight in a lift","N = m(g + a) accelerating up; m(g − a) accelerating down; zero in free fall"],
["Minimum force to pull a block on rough ground","Pull at θ = tan⁻¹μ above horizontal; F_min = μmg/√(1 + μ²)"],
["Newton's third law pairs","Equal, opposite, act on different bodies, so they never cancel on a single body"],
["Rocket propulsion","Thrust F = u(dm/dt); v = v₀ + u ln(m₀/m) − gt"],
["Springs: series, parallel, cut","Series 1/k = Σ1/kᵢ; parallel k = Σkᵢ; a spring cut to 1/n of its length has constant nk"],
["Pseudo force","F = −m·a_frame in an accelerating frame, so Newton's laws can be applied there"],
["Contact force between two pushed blocks","N = m₂F/(m₁ + m₂) on block 2 when F pushes block 1 (smooth surface)"]
],
"Work, Energy & Collisions": [
["Work by a variable force","W = ∫F·dx (area under F–x graph)"],
["Conservative force and potential energy","F = −dU/dx; work around any closed loop is zero"],
["Vertical circle with a string","Top: v ≥ √(gR); bottom: v ≥ √(5gR); T_bottom − T_top = 6mg"],
["Perfectly inelastic collision","v = (m₁u₁ + m₂u₂)/(m₁ + m₂); maximum loss of kinetic energy"],
["Kinetic energy and momentum","KE = p²/2m; p = √(2m·KE)"],
["KE lost when m₁ hits stationary m₂ and sticks","Fraction lost = m₂/(m₁ + m₂)"],
["Equal-mass oblique elastic collision (target at rest)","The two bodies move off at 90° to each other"],
["Work by gravity and friction on an incline","W_g = mgh (path independent); W_f = −μmg cosθ × length"]
],
"Circular & Rotational Motion": [
["Angular and linear quantities","v = ωr; a_t = αr; a_c = ω²r; ω = 2πf = 2π/T"],
["Conical pendulum","tanθ = v²/(rg); T = 2π√(l cosθ/g)"],
["Radius of gyration","I = Mk²; k = √(I/M)"],
["Moments of inertia: hollow sphere, solid cylinder, disc about diameter","Hollow sphere (2/3)MR²; solid cylinder ½MR²; disc about a diameter ¼MR²"],
["Rolling down an incline","a = g sinθ/(1 + k²/R²); speed at bottom: solid sphere > disc > hollow sphere > ring"],
["Rotational KE, work and power","KE = ½Iω²; W = τθ; P = τω"],
["Condition for pure rolling","v_cm = ωR; the contact point is instantaneously at rest"],
["Angular impulse","∫τ dt = ΔL"],
["Toppling versus sliding of a block","Slides if F > μmg; topples about the edge if F·h > mg·(b/2)"]
],
"Gravitation": [
["Total energy of a satellite","E = −GMm/2r; KE = +GMm/2r; PE = −GMm/r"],
["Geostationary satellite","Period 24 h, equatorial, height ≈ 36,000 km (radius ≈ 42,400 km), same sense as Earth's rotation"],
["Effect of Earth's rotation on g","g′ = g − Rω²cos²λ; no effect at poles, maximum reduction at the equator"],
["Weightlessness in orbit","Satellite and occupant fall together, so apparent weight is zero; gravity still acts"],
["Field and potential of a uniform spherical shell","Outside GM/r²; inside zero; potential inside constant = −GM/R"],
["Field inside a uniform solid sphere","g = GMr/R³ (linear in r) inside; GM/r² outside"]
],
"Properties of Matter": [
["Poisson's ratio","σ = lateral strain / longitudinal strain; between −1 and 0.5"],
["Extension of a wire and stored energy","Δl = FL/(AY); U = ½FΔl"],
["Thermal stress","Stress = YαΔT when expansion is prevented"],
["Reynolds number","Re = ρvd/η; laminar below ~1000, turbulent above ~2000–3000"],
["Surface energy and soap bubble work","Surface energy = T × ΔA; blowing a soap bubble of radius R needs W = 8πR²T (two surfaces)"],
["Contact angle and wetting","θ < 90°: wets, concave meniscus, rises. θ > 90°: does not wet, convex meniscus, depressed"],
["Hydrostatic pressure and Pascal's law","P = P₀ + ρgh; pressure on a confined fluid is transmitted undiminished"],
["Buoyancy and floating","Upthrust = weight of displaced fluid; fraction submerged = ρ_object/ρ_fluid"]
],
"Thermal Physics & KTG": [
["Average KE per molecule","(3/2)k_BT, independent of the gas"],
["Work in an isobaric process","W = PΔV = nRΔT"],
["Adiabatic T–V and T–P relations","TV^(γ−1) = const; T^γ P^(1−γ) = const"],
["Work in a cyclic process","Net work = area enclosed on the P–V diagram (clockwise positive)"],
["Refrigerator COP","COP = T₂/(T₁ − T₂) = Q₂/W"],
["Cv and Cp from degrees of freedom","Cv = fR/2; Cp = (f/2 + 1)R"],
["Mean free path","λ = 1/(√2 π d² n)"],
["Heat capacity in different processes","Isothermal: infinite; adiabatic: zero; isobaric: Cp; isochoric: Cv"],
["Calorimetry principle","Heat lost = heat gained; T_final = Σ(mcT)/Σ(mc) with no phase change"],
["Adiabatic versus isothermal slope","The adiabat is steeper by a factor γ"],
["Latent heats of water","L_f ≈ 80 cal/g (3.36×10⁵ J/kg); L_v ≈ 540 cal/g (2.26×10⁶ J/kg)"],
["Thermal resistance in series and parallel","R = L/kA; series: resistances add; parallel: conductances add"]
],
"Oscillations & Waves": [
["Spring combinations: time period","Series T = 2π√(m(1/k₁ + 1/k₂)); parallel T = 2π√(m/(k₁ + k₂))"],
["Averages of KE and PE in SHM","Both average ¼kA² over a cycle; KE = ½k(A² − x²), PE = ½kx²"],
["Displacement when KE = PE","x = ±A/√2"],
["Standing wave spacings","Adjacent nodes (or antinodes) λ/2 apart; node to antinode λ/4"],
["Travelling wave equation","y = A sin(kx − ωt + φ); v = ω/k; k = 2π/λ"],
["Superposition of two waves","A = √(A₁² + A₂² + 2A₁A₂cosφ); I ∝ A²"],
["End correction in an open pipe","e ≈ 0.6r per open end"],
["Other oscillators","Physical pendulum T = 2π√(I/mgd); torsional T = 2π√(I/C)"],
["Pendulum in an accelerating lift","T = 2π√(l/g_eff); g_eff = g + a (up), g − a (down), 0 in free fall"],
["Damped and forced oscillations","Damped amplitude decays as e^(−bt/2m); resonance when driving frequency ≈ natural frequency"],
["Intensity of a point source of sound","I = P/(4πr²), so I ∝ 1/r²; also I ∝ A²ω²"]
],
"Electrostatics": [
["Quantisation and conservation of charge","q = ne with e = 1.6×10⁻¹⁹ C; charge of an isolated system is conserved"],
["Flux through a closed surface","Φ = q_enc/ε₀; charge at a cube's centre gives q/6ε₀ per face"],
["Field on the axis of a ring","E = kQx/(R² + x²)^(3/2); zero at the centre, maximum at x = R/√2"],
["Field on the axis of a disc","E = (σ/2ε₀)[1 − x/√(x² + R²)]"],
["Potential of a charged conducting shell","Outside kQ/r; on and inside kQ/R (constant); field inside zero"],
["Work done in moving a charge","W = q(V_B − V_A); independent of path"],
["Potential of a dipole","V = kp cosθ/r²; zero on the equatorial line"],
["Equipotential surfaces","Field is perpendicular to them; no work along them; closer spacing means stronger field"],
["Charged particle in a uniform field","a = qE/m; deflection y = qEx²/(2mv²)"],
["Properties of electric field lines","Start on +, end on −; never cross; perpendicular to a conductor surface; none inside a conductor"]
],
"Capacitance": [
["Dielectric inserted: battery connected vs disconnected","Connected: V constant, C ×K, Q ×K, U ×K. Disconnected: Q constant, V ÷K, U ÷K"],
["Charge sharing between two capacitors","V = (C₁V₁ + C₂V₂)/(C₁ + C₂); energy lost = C₁C₂(V₁ − V₂)²/2(C₁ + C₂)"],
["Capacitor with a partial dielectric slab","C = ε₀A/(d − t + t/K) for slab thickness t"],
["Charging an RC circuit","q = CV(1 − e^(−t/RC)); time constant τ = RC"],
["Electrostatic pressure on plates","σ²/2ε₀ per unit area; F = Q²/2ε₀A"],
["Cylindrical capacitor","C = 2πε₀l/ln(b/a)"]
],
"Current Electricity": [
["Mobility, conductivity, current density","μ = v_d/E; σ = 1/ρ = neμ; J = σE = nev_d"],
["Cells in series and parallel","Series: ε and r add. n identical in parallel: same ε, r/n"],
["Joule heating","H = I²Rt = V²t/R; at the same voltage a higher-wattage bulb has lower resistance"],
["Resistivity versus temperature","Metals increase with T; semiconductors and insulators decrease; manganin and constantan nearly constant"],
["Cube of resistors (each R)","Adjacent corners 7R/12; face diagonal 3R/4; body diagonal 5R/6"],
["Resistor colour code","Black 0, Brown 1, Red 2, Orange 3, Yellow 4, Green 5, Blue 6, Violet 7, Grey 8, White 9"],
["Ideal ammeter and voltmeter","Ammeter: zero resistance, in series. Voltmeter: infinite resistance, in parallel"],
["Bulbs in series versus parallel","Series: same current, higher resistance glows brighter (I²R). Parallel: same voltage, lower resistance glows brighter (V²/R)"],
["Power delivered to a load by a cell","P = ε²R/(R + r)²; maximum ε²/4r at R = r (efficiency 50%)"]
],
"Magnetism": [
["Force between parallel currents","F/l = μ₀I₁I₂/(2πd); attractive when currents are parallel"],
["Helical motion in a magnetic field","r = mv⊥/qB; pitch = 2πm v∥/qB; speed is constant, B does no work"],
["Magnetic moment of a current loop","m = NIA; far on its axis B = μ₀m/(2πx³)"],
["Hall effect","V_H = BI/(nqt); its sign shows the carrier type"],
["Field at the centre of a circular arc","B = μ₀Iθ/(4πR) with θ in radians"],
["Field of a finite straight wire","B = (μ₀I/4πd)(sinα + sinβ)"],
["Earth's magnetic field components","B_H = B cosδ; B_V = B sinδ; tanδ = B_V/B_H"],
["Curie's law","χ = C/T for paramagnets; ferromagnets turn paramagnetic above the Curie temperature"],
["Galvanometer sensitivity","Current sensitivity θ/I = NAB/C; voltage sensitivity θ/V = NAB/(CR)"]
],
"EMI & AC": [
["Lenz's law","Induced current opposes the change in flux that causes it (energy conservation)"],
["LR circuit growth and decay","I = I₀(1 − e^(−t/τ)) growing; I₀e^(−t/τ) decaying; τ = L/R"],
["LC oscillations","f = 1/(2π√(LC)); energy swaps between ½CV² and ½LI²"],
["Reactances","X_L = ωL; X_C = 1/ωC; current lags in L by 90°, leads in C by 90°"],
["Series resonance","Z = R (minimum), current maximum, ω₀ = 1/√(LC), Q = ω₀L/R"],
["Average and rms of sinusoidal current","Half-cycle average 2I₀/π; full-cycle average 0; rms I₀/√2"],
["Transformer losses","Copper, iron (eddy + hysteresis), flux leakage, humming; step-up has N_s > N_p"],
["Eddy currents","Induced currents in bulk conductors; reduced by laminating; used in induction furnaces and braking"],
["Charge flowing due to flux change","q = ΔΦ/R, independent of time taken"],
["Wattless current","Current 90° out of phase with voltage in pure L or C; average power zero"],
["Emf of a rotating coil","ε = NBAω sinωt; peak NBAω"]
],
"EM Waves": [
["Nature of EM waves","Produced by accelerating charges; transverse; E ⊥ B ⊥ direction; speed c in vacuum"],
["Intensity and radiation pressure","I = ½ε₀E₀²c; pressure I/c (absorbed), 2I/c (reflected)"],
["Uses of EM bands","Radio: communication; microwave: radar/oven; IR: heating, remotes; UV: sterilisation; X-ray: imaging; γ: cancer therapy"],
["Energy density of an EM wave","u = ε₀E² (half electric, half magnetic)"]
],
"Ray Optics": [
["Two thin lenses separated by d","1/F = 1/f₁ + 1/f₂ − d/(f₁f₂)"],
["Apparent depth and slab shift","Apparent depth = real/n; a slab of thickness t shifts the image by t(1 − 1/n)"],
["Thin prism and dispersion","δ = (n − 1)A; angular dispersion (n_v − n_r)A; dispersive power (n_v − n_r)/(n_y − 1)"],
["Lens in a medium","1/f = (n_l/n_m − 1)(1/R₁ − 1/R₂); a convex lens with n_l < n_m diverges"],
["Magnification formulas","Lens m = v/u; mirror m = −v/u; magnifier m = 1 + D/f (image at D), D/f (at infinity)"],
["Telescope and microscope","Astronomical telescope normal adjustment L = f_o + f_e; compound microscope m = (v_o/u_o)(1 + D/f_e)"],
["Defects of vision","Myopia: concave lens; hypermetropia: convex lens; astigmatism: cylindrical lens; presbyopia: bifocal"],
["Sign convention","Distances measured from the pole/optical centre; along incident light is positive; concave mirror has negative f"],
["Optical phenomena using TIR","Mirage, optical fibres, sparkling of diamond; rainbow combines refraction, dispersion and TIR"],
["Cutting a lens in half","Along the axis: same f, dimmer image. Across the axis: focal length doubles"]
],
"Wave Optics": [
["Resultant intensity in interference","I = I₁ + I₂ + 2√(I₁I₂)cosφ; I_max = (√I₁ + √I₂)²; equal sources I = 4I₀cos²(φ/2)"],
["Phase and path difference","φ = (2π/λ)Δx"],
["Fringe shift with a thin sheet","Shift = (n − 1)tD/d"],
["Single slit versus double slit","Single slit: wide central maximum, minima at a sinθ = nλ. Double slit: equal fringes under a diffraction envelope"],
["Coherent sources","Constant phase difference, same frequency, comparable amplitudes"],
["Fresnel distance","z_F = a²/λ; ray optics holds for distances well below it"],
["Thin film interference","Reflected bright: 2nt cosr = (m + ½)λ (extra π on reflection from the denser medium); transmitted conditions are reversed"]
],
"Dual Nature": [
["de Broglie wavelength of an electron through V volts","λ = 12.27/√V Å"],
["Photoelectric effect dependences","Intensity ↑ gives more photocurrent (above threshold); KE_max depends only on frequency; no time lag"],
["Stopping potential versus frequency graph","Straight line with slope h/e and intercept ν₀ on the frequency axis"],
["Momentum of a photon","p = h/λ = E/c"],
["Davisson–Germer experiment","Electron diffraction from nickel confirmed the wave nature of matter (54 eV, 65°)"],
["Quick numbers: hc and work function","hc = 1240 eV·nm; φ = hc/λ₀"],
["Radiation force from light","F = P/c (absorbed), 2P/c (reflected)"]
],
"Atoms & Nuclei": [
["Hydrogen spectral series","Lyman (UV, to n = 1); Balmer (visible, n = 2); Paschen, Brackett, Pfund (IR)"],
["Distance of closest approach (Rutherford)","r₀ = 2kZe²/KE for an α particle"],
["Spectral lines from level n","n(n − 1)/2 lines in all transitions down from n"],
["Nuclear force","Short-range (~fm), strongest, charge-independent, saturating, non-central"],
["Fission and fusion","Fission: heavy nucleus splits (~200 MeV). Fusion: light nuclei combine (needs ~10⁷ K). Both raise BE per nucleon"],
["Decay by half-lives","N = N₀(½)^(t/T); fraction left after n half-lives is (½)ⁿ"],
["Q value of a nuclear reaction","Q = (Σm_reactants − Σm_products)c²; positive means energy released"],
["Binding energy per nucleon curve","Peaks near Fe-56 (~8.8 MeV): light nuclei fuse, heavy ones fission"],
["Moseley's law","√ν = a(Z − b); characteristic X-ray frequencies identify the element"],
["Conservation in nuclear reactions","Total A and total Z are the same on both sides"]
],
"Semiconductors & Communication": [
["Band gaps","Conductor: overlapping bands; semiconductor Eg ≈ 1 eV (Si 1.1, Ge 0.7); insulator Eg > 3 eV"],
["Diode bias","Forward: depletion layer narrows, conducts after knee (Si 0.7 V, Ge 0.3 V). Reverse: tiny leakage"],
["Rectification","Half-wave: one diode, output frequency = input. Full-wave: output frequency = 2× input"],
["Basic gate truth tables","AND 1 only if both 1; OR 0 only if both 0; NOT inverts; NAND = NOT AND; NOR = NOT OR; XOR 1 if inputs differ"],
["Transistor as amplifier and switch","Common emitter inverts the signal (180°); cut-off acts as OFF, saturation as ON"],
["LED, photodiode, solar cell","LED: forward biased, emits light. Photodiode: reverse biased detector. Solar cell: no bias, generates emf"],
["Carrier concentrations","Intrinsic n_e = n_h; doped n_e·n_h = n_i²"],
["Communication basics","Modulation index μ = A_m/A_c ≤ 1; AM bandwidth = 2f_m; ground, sky and space wave propagation"]
]
},
C: {
"Mole Concept": [
["Equivalent mass and normality","Eq. mass = M/n-factor; N = n-factor × M; at equivalence N₁V₁ = N₂V₂"],
["Empirical and molecular formula","Molecular formula = n × empirical; n = molar mass/empirical mass"],
["Limiting reagent","The reagent with the smallest (moles ÷ coefficient)"],
["Mole fraction and ppm","x_A = n_A/Σn; ppm = (mass solute/mass solution)×10⁶"],
["Percent yield and purity","% yield = actual/theoretical × 100; % purity = pure mass/sample mass × 100"],
["Average molar mass of a gas mixture","M_avg = Σ xᵢMᵢ using mole fractions"],
["Molarity and molality from density","M = 10 d (%w/w)/M₀; molality = 1000M/(1000d − M·M₀)"],
["Laws of chemical combination","Conservation of mass, constant proportions, multiple proportions, Gay-Lussac's volumes, Avogadro's law"]
],
"Atomic Structure": [
["Bohr quantisation conditions","mvr = nh/2π; 2πr = nλ"],
["Bohr radius, speed, energy","rₙ = 0.529 n²/Z Å; vₙ = 2.18×10⁶ Z/n m/s; Eₙ = −13.6 Z²/n² eV"],
["Number of spectral lines","n(n − 1)/2 for all transitions from level n"],
["Slater's rules","Z_eff = Z − σ; same group 0.35 (1s: 0.30); (n−1) shell 0.85; deeper shells 1.00"],
["Photon energy per mole","E = hν = hc/λ; per mole N_A·hν; 1 eV/atom = 96.5 kJ/mol"],
["(n + l) rule order","Lower n + l fills first (ties: lower n): 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s"],
["Limitations of atomic models","Thomson: no nucleus. Rutherford: unstable atom. Bohr: only one-electron systems, fails Zeeman, violates uncertainty"],
["Allowed values for n = 3","l = 0, 1, 2; orbitals n² = 9; maximum 18 electrons"],
["Isotopes, isobars, isotones","Same Z / same A / same neutron number"],
["Meaning of ψ and ψ²","ψ² is probability density; radial probability is 4πr²ψ²"]
],
"Periodic Table": [
["Isoelectronic species: radius order","Higher Z means smaller: Al³⁺ < Mg²⁺ < Na⁺ < F⁻ < O²⁻ < N³⁻"],
["Oxidation state exceptions","F always −1; O −2 (peroxide −1, superoxide −½, OF₂ +2); H −1 in metal hydrides"],
["Ionisation enthalpy order in period 2","Li < B < Be < C < O < N < F < Ne"],
["Atomic radius trends","Decreases across a period (Z_eff rises), increases down a group"],
["Nature of oxides","Metal oxides basic; non-metal oxides acidic; Al₂O₃, ZnO, SnO, PbO amphoteric; CO, NO neutral"],
["Electron gain enthalpy order","Group 17: Cl > F > Br > I. Group 16: S > O > Se > Te (more negative first)"],
["Pauling electronegativity values","F 4.0, O 3.5, N 3.0, Cl 3.0, C 2.5, H 2.1"]
],
"Chemical Bonding": [
["Hybridisation from steric number","H = ½(V + M − C + A); 2 sp, 3 sp², 4 sp³, 5 sp³d, 6 sp³d²"],
["Bond length and strength with bond order","C–C 154 pm > C=C 134 > C≡C 120; strength increases the other way"],
["Hydrogen bonding effects","Raises boiling points (H₂O, HF, NH₃); makes ice less dense than water"],
["Bond angle orders","NH₃ 107° > PH₃ 93.5° > AsH₃ 92°; H₂O 104.5° > H₂S 92°"],
["VSEPR repulsion order","lp–lp > lp–bp > bp–bp"],
["Solubility: lattice versus hydration energy","Dissolves if hydration energy exceeds lattice energy; LiF is poorly soluble, CsI soluble"],
["Formal charge","FC = V − N − B/2; best structure has smallest formal charges, negative on the more electronegative atom"],
["Bond order of O₂⁺, N₂⁺, NO","All 2.5; NO and O₂⁺ are paramagnetic"],
["Zero dipole moment molecules","Symmetric BF₃, CH₄, CO₂, trans-1,2-dichloroethene; cis isomers are polar"],
["Bonding versus antibonding MOs","Bonding: lower energy, constructive overlap. Antibonding: higher energy, node between nuclei"]
],
"States of Matter": [
["Gas laws","Boyle PV = const; Charles V/T = const; Avogadro V/n = const; combined PV/T = const"],
["Molar mass from gas density","M = dRT/P"],
["Critical temperature","Above T_c a gas cannot be liquefied by pressure; larger a gives higher T_c"],
["Coordination numbers and voids","SC 6; BCC 8; FCC/HCP 12; tetrahedral voids 2 per atom, octahedral voids 1 per atom"],
["Packing efficiency formula","PE = Z·(4/3)πr³/a³ × 100"],
["Liquids: effect of temperature","Viscosity and surface tension fall as temperature rises; gas viscosity rises"],
["Types of solids","Ionic: brittle, conduct when molten. Metallic: conduct. Network covalent: hard, insulating (graphite conducts). Molecular: soft, low m.p."],
["Doped semiconductors","n-type: group 15 impurity in Si/Ge. p-type: group 13 impurity"],
["Magnetic solids","Paramagnetic: unpaired e⁻. Diamagnetic: all paired. Ferromagnetic: aligned domains. Ferrimagnetic: Fe₃O₄. Antiferromagnetic: MnO"],
["X-ray diffraction","nλ = 2d sinθ; cubic d = a/√(h² + k² + l²)"]
],
"Thermodynamics": [
["Extensive versus intensive","Extensive: mass, V, U, H, S, G. Intensive: T, P, density, concentration, molar properties"],
["Reversible isothermal expansion","w = −nRT ln(V₂/V₁); free expansion: w = 0, q = 0"],
["Heat capacity relations","Cp − Cv = R per mole; ΔU = nCvΔT; ΔH = nCpΔT"],
["Reaction enthalpy from formation enthalpies","ΔH = ΣΔH_f(products) − ΣΔH_f(reactants); elements in standard state have ΔH_f = 0"],
["Third law and entropy of fusion","Perfect crystal at 0 K has S = 0; ΔS_fus = ΔH_fus/T_m"],
["Spontaneity summary","ΔH<0, ΔS>0 always; ΔH>0, ΔS<0 never; ΔH<0, ΔS<0 at low T; ΔH>0, ΔS>0 at high T"],
["Born–Haber cycle","Uses sublimation, ionisation, dissociation, electron gain and lattice enthalpy via Hess's law"],
["Resonance energy","Calculated ΔH_f minus observed ΔH_f; benzene ≈ 152 kJ/mol"],
["Joule–Thomson effect","Zero for an ideal gas; a real gas cools on expansion below its inversion temperature"]
],
"Equilibrium": [
["Le Chatelier's principle","The system shifts to oppose a change in concentration, pressure or temperature; a catalyst changes rate only"],
["Kw and temperature","Kw = 10⁻¹⁴ at 25 °C and increases with T, so neutral pH < 7 when hot"],
["Ka and Kb of a conjugate pair","Ka × Kb = Kw; pKa + pKb = 14"],
["Hydrolysis constant and degree","K_h = Kw/Ka (anion of weak acid); h = √(K_h/C)"],
["Common ion effect","Lowers solubility; precipitation when Q > Ksp"],
["pH after mixing acid and base","Net moles H⁺ (or OH⁻) after neutralisation ÷ total volume"],
["Reaction quotient","Q < K forward; Q > K backward; ΔG = ΔG° + RT ln Q"],
["Kp for A ⇌ 2B with degree of dissociation α","Kp = 4α²P/(1 − α²)"],
["Basic buffer","pOH = pKb + log([salt]/[base])"],
["Lewis acids and bases","Acid: electron-pair acceptor (BF₃, AlCl₃, H⁺). Base: donor (NH₃, OH⁻)"],
["Indicator choice in titration","Phenolphthalein (8.3–10): weak acid + strong base. Methyl orange (3.1–4.4): strong acid + weak base"]
],
"Redox & Electrochemistry": [
["Oxidation numbers: Cr, Mn, S","Cr in Cr₂O₇²⁻ +6; Mn in MnO₄⁻ +7; S in S₂O₃²⁻ +2 (average); SO₄²⁻ +6"],
["n-factors in redox","MnO₄⁻ → Mn²⁺ 5; Cr₂O₇²⁻ → Cr³⁺ 6; C₂O₄²⁻ → CO₂ 2; Fe²⁺ → Fe³⁺ 1"],
["Electrochemical series trends","Higher E° means stronger oxidising agent; Li lowest (−3.05 V), F₂ highest (+2.87 V)"],
["Cell EMF","E°cell = E°cathode − E°anode; oxidation happens at the anode"],
["Equilibrium constant from E°","log K = nE°/0.0591 at 298 K"],
["Electrolysis products","Cathode: species with higher reduction potential. Aqueous NaCl: H₂ at cathode, Cl₂ at anode"],
["Faraday's second law","Masses deposited by the same charge are proportional to equivalent weights"],
["Common cells","Lead storage: PbO₂/Pb in H₂SO₄ gives 2 V per cell. H₂–O₂ fuel cell: anode H₂ + 2OH⁻ → 2H₂O + 2e⁻"],
["Concentration cell","E = (0.0591/n) log(C₂/C₁) with E° = 0"],
["Corrosion of iron","Anode: Fe → Fe²⁺ + 2e⁻; cathode: O₂ + 4H⁺ + 4e⁻ → 2H₂O; rust Fe₂O₃·xH₂O; prevented by galvanising"]
],
"Chemical Kinetics": [
["Units of rate constant","(mol/L)^(1−n) s⁻¹: zero order mol L⁻¹ s⁻¹; first order s⁻¹; second order L mol⁻¹ s⁻¹"],
["Pseudo first order reaction","One reactant in large excess, e.g. ester hydrolysis, sucrose inversion"],
["Half-life for nth order","t½ ∝ [A]₀^(1−n)"],
["Temperature effect on rate","k₂/k₁ = e^{(Ea/R)(1/T₁ − 1/T₂)}; rate often doubles per 10 K"],
["Collision theory","Rate = collision frequency × fraction with E ≥ Ea × steric factor"],
["Catalyst","Lowers Ea, raises k; no change in ΔH or K"],
["Time for 99.9% completion (first order)","t = 6.909/k ≈ 10 × t½"],
["Order from initial rates","rate₂/rate₁ = (C₂/C₁)ⁿ when only one concentration is changed"]
],
"Solutions": [
["Osmotic pressure","π = iCRT; isotonic solutions have equal π"],
["Relative lowering of vapour pressure","(p° − p)/p° = x_solute"],
["Kb and Kf of water","K_b = 0.52 and K_f = 1.86 K kg/mol; K_b = RT_b²M₁/(1000ΔH_vap)"],
["Abnormal molar mass","Dissociation: i > 1; association: i < 1; α = (i − 1)/(n − 1)"],
["Ideal versus non-ideal solutions","Ideal: ΔH_mix = 0, ΔV_mix = 0. Positive deviation: weaker A–B (ethanol–water). Negative deviation: stronger A–B (HNO₃–water)"],
["Gas solubility","Increases with pressure (Henry), decreases with temperature"],
["Ranking colligative effect at equal molality","Higher i gives larger ΔT_b and lower freezing point: Al₂(SO₄)₃ (5) > Na₂SO₄ (3) > NaCl (2) > glucose (1)"],
["Reverse osmosis","Pressure above π applied on the solution side; used for desalination"]
],
"Surface Chemistry": [
["Physisorption versus chemisorption","Physi: weak van der Waals, reversible, multilayer, low T. Chemi: chemical bonds, irreversible, monolayer, high Ea"],
["Types of catalysis","Homogeneous, heterogeneous (Fe in Haber), enzyme (specific), autocatalysis (Mn²⁺ in KMnO₄/oxalic acid)"],
["Classification of colloids","Lyophilic (reversible, stable) vs lyophobic; multimolecular, macromolecular, associated (micelles)"],
["Tyndall effect and Brownian motion","Light scattering by colloidal particles; zig-zag motion keeps sols stable"],
["Emulsion types","O/W (milk), W/O (butter); an emulsifier is required"],
["Charge on sols and gold number","Fe(OH)₃ positive, As₂S₃ negative; smaller gold number means better protective colloid"],
["Enzymes","Biocatalysts with lock-and-key specificity; optimum ~298–310 K and a particular pH"]
],
"s & p Block": [
["Group 1 trends","Down the group: larger size, lower ionisation energy, more reactive; Li has the highest hydration enthalpy"],
["Alkali metal oxides","Li → Li₂O; Na → Na₂O₂; K, Rb, Cs → superoxides MO₂ (paramagnetic)"],
["Anomalous behaviour of beryllium","Small size and high charge density: covalent compounds, amphoteric BeO, forms [BeF₄]²⁻"],
["Solubility trends in group 2","Sulphates decrease down the group; hydroxides increase (Mg(OH)₂ < Ba(OH)₂)"],
["Lewis acidity of boron halides","BI₃ > BBr₃ > BCl₃ > BF₃ (back bonding is strongest in BF₃)"],
["Allotropes of carbon","Diamond, graphite, graphene, fullerenes (C₆₀: 20 hexagons, 12 pentagons)"],
["Acidity of oxoacids","HClO₄ > HClO₃ > HClO₂ > HClO; H₃PO₃ is dibasic, H₃PO₂ monobasic"],
["Oxides of nitrogen","N₂O laughing gas; NO neutral; NO₂ brown and acidic; N₂O₅ anhydride of HNO₃"],
["Hydrides of group 16","Acidity H₂O < H₂S < H₂Se < H₂Te; thermal stability decreases down the group"],
["Interhalogen compounds","XX′, XX′₃, XX′₅, XX′₇ (X is the larger halogen); ClF₃, BrF₅, IF₇; more reactive than halogens except F₂"],
["Ozone","Bent, diamagnetic, strong oxidiser; estimated iodometrically; shields from UV"],
["Noble gases","Only Xe (and Kr, Rn) form compounds; first was XePtF₆; boiling points rise down the group"]
],
"d & f Block": [
["Variable oxidation states in 3d series","Mn shows +2 to +7; +2 and +3 are most common; highest states appear in oxides and fluorides"],
["Spin-only moments","1 e⁻ 1.73 BM; 2: 2.83; 3: 3.87; 4: 4.90; 5: 5.92"],
["Preparation of K₂Cr₂O₇","FeCr₂O₄ + Na₂CO₃/O₂ → Na₂CrO₄ → acidify → Na₂Cr₂O₇ → add KCl → K₂Cr₂O₇"],
["Preparation of KMnO₄","MnO₂ fused with KOH/O₂ → K₂MnO₄ → oxidise electrolytically or disproportionate in acid → KMnO₄"],
["Catalysis by transition metals","Variable oxidation states and surface adsorption: Fe (Haber), V₂O₅ (contact), Ni (hydrogenation), Pt/Pd"],
["Common alloys","Brass Cu + Zn; bronze Cu + Sn; steel Fe + C; misch metal lanthanoids + Fe"],
["Actinoids versus lanthanoids","Actinoids are radioactive, show more oxidation states (+3 to +7) and 5f orbitals are less buried"],
["Why Zn, Cd, Hg are not typical transition metals","Full d¹⁰ in ground and common oxidation states; low melting points"],
["Interstitial compounds","Small atoms (H, C, N) in the lattice give hard, high-melting, non-stoichiometric solids like TiC"]
],
"Coordination Compounds": [
["Werner's theory","Primary valence = oxidation state (ionisable); secondary valence = coordination number (non-ionisable, directional)"],
["Types of ligands","Monodentate Cl⁻; bidentate en, ox²⁻; hexadentate EDTA; ambidentate NO₂⁻/ONO⁻, SCN⁻/NCS⁻"],
["Hybridisation and geometry","sp³ tetrahedral; dsp² square planar (Ni²⁺/CN⁻, Pt²⁺); d²sp³ inner octahedral (low spin); sp³d² outer octahedral (high spin)"],
["Geometrical isomers","Square planar MA₂B₂ cis/trans; octahedral MA₄B₂ cis/trans; MA₃B₃ fac/mer"],
["Stability of complexes","Chelation raises stability; high metal charge and strong-field ligands raise the stability constant"],
["Colour of complexes","d–d transitions absorb a colour and show its complement; d⁰ and d¹⁰ are colourless"],
["CFSE for octahedral complexes","CFSE = (−0.4x + 0.6y)Δ₀ + pairing energy (x t₂g, y e_g electrons)"],
["Tetrahedral versus octahedral splitting","Δt = (4/9)Δ₀, so tetrahedral complexes are almost always high spin"],
["Naming rules","Ligands in alphabetical order then metal; anionic complexes end in -ate; oxidation state in Roman numerals"],
["Metal carbonyls","Ni(CO)₄ tetrahedral; Fe(CO)₅ trigonal bipyramidal; σ donation plus π back-bonding"],
["Importance of complexes","Haemoglobin Fe, chlorophyll Mg, vitamin B₁₂ Co, cisplatin Pt (anti-cancer), EDTA for lead poisoning"]
],
"Metallurgy & Salt Analysis": [
["Ellingham diagram","ΔG° vs T for oxide formation; a metal whose line is lower can reduce oxides of metals above it"],
["Concentration of ores","Gravity separation, magnetic separation, froth flotation, leaching (bauxite with NaOH)"],
["Extraction in brief","Cu: roast + self-reduction in Bessemer converter. Zn: roast ZnS → ZnO, reduce with C. Fe: blast furnace with coke"],
["Cyanide process","Ag/Au dissolve in NaCN with air; Zn displaces: 2[Ag(CN)₂]⁻ + Zn → [Zn(CN)₄]²⁻ + 2Ag"],
["Anion tests","CO₃²⁻ effervescence with dil. HCl; S²⁻ nitroprusside violet; SO₄²⁻ BaCl₂ white; Cl⁻ AgNO₃ white (soluble in NH₃); Br⁻ pale yellow; I⁻ yellow"],
["Cation tests","Cu²⁺ black CuS (group II); Fe³⁺ + KSCN blood red; Zn²⁺ white ZnS; Mn²⁺ pink MnS; Ni²⁺ + DMG red; Pb²⁺ PbI₂ yellow"],
["Borax bead colours","Cu blue; Cr green; Co blue; Mn violet; Fe yellow (oxidising flame)"],
["Oxalic acid vs KMnO₄ titration","KMnO₄ is a self-indicator; acidify with dil. H₂SO₄; warm to 60–70 °C; end point permanent pink"]
],
"GOC & Isomerism": [
["Inductive effect order","−I: NO₂ > CN > F > Cl > Br > I > OH > OR > C₆H₅. +I: tertiary > secondary > primary alkyl > CH₃"],
["Resonance effect groups","+R: OH, OR, NH₂, halogens. −R: NO₂, CN, CHO, COR, COOH"],
["Hyperconjugation","σ(C–H) delocalising into an adjacent π or empty p orbital; more α-H gives more stability"],
["R/S configuration","Rank by atomic number (CIP rules), lowest priority at the back; 1 → 2 → 3 clockwise is R"],
["E/Z designation","Higher-priority groups on the same side is Z; opposite sides is E"],
["Tautomerism","Keto–enol and nitro–aci forms; needs α-H next to a carbonyl"],
["Conditions for optical activity","Chiral centre or no plane/centre of symmetry; enantiomers rotate equally and oppositely; racemic mixture is inactive"],
["Stability of intermediates","Free radical 3° > 2° > 1° > CH₃•; carbocation likewise; carbanion the reverse"],
["Nucleophiles and electrophiles","Nucleophile: electron-rich (OH⁻, NH₃, CN⁻). Electrophile: electron-poor (H⁺, NO₂⁺, carbocations, AlCl₃)"],
["Substituent effects on acidity of acids","Electron-withdrawing groups raise acidity; donating groups lower it; ortho-substituted benzoic acids are stronger"],
["Pyrrole versus pyridine basicity","Pyridine's lone pair is available and basic; pyrrole's is part of the aromatic sextet and not basic"],
["Lassaigne's test","Na fusion extract: N as NaCN (Prussian blue), S as Na₂S (violet with nitroprusside), halogens as NaX (AgNO₃)"],
["Kjeldahl's method","N → (NH₄)₂SO₄ → NH₃; %N = 1.4 × N × V/m; fails for nitro, azo and ring nitrogen compounds"]
],
"Hydrocarbons": [
["Selectivity of free-radical halogenation","Br₂ is highly selective (3° ≫ 2° ≫ 1°); Cl₂ less so; F₂ explosive; I₂ reversible"],
["Ozonolysis","Alkene + O₃ then Zn/H₂O gives carbonyls at the double bond; H₂O₂ work-up gives acids/ketones"],
["Baeyer's test","Cold dilute alkaline KMnO₄ is decolourised; gives a glycol (syn addition)"],
["Acidic hydrogen of terminal alkynes","Reacts with NaNH₂, ammoniacal AgNO₃ (white ppt) and Cu₂Cl₂ (red ppt)"],
["Birch reduction","Benzene + Na/liq. NH₃, ROH → 1,4-cyclohexadiene"],
["Electrophiles in aromatic substitution","Nitration NO₂⁺; sulphonation SO₃; halogenation Cl⁺/Br⁺ with FeX₃; Friedel–Crafts R⁺ or RCO⁺ with AlCl₃"],
["Cyclohexane conformations","Chair is most stable; bulky groups prefer equatorial positions"],
["Heat of hydrogenation and stability","Lower heat of hydrogenation means a more stable alkene; benzene releases 152 kJ less than expected"],
["HBr addition to propene","Without peroxide: 2-bromopropane (Markovnikov). With peroxide: 1-bromopropane"],
["Aromatic and anti-aromatic examples","Aromatic: benzene, pyridine, cyclopentadienyl anion, tropylium cation. Anti-aromatic: cyclobutadiene"]
],
"Haloalkanes & Haloarenes": [
["Conditions favouring SN1 and SN2","SN2: polar aprotic solvent, strong nucleophile. SN1: polar protic solvent, weak nucleophile"],
["Reactivity of alkyl halides","R–I > R–Br > R–Cl > R–F (weaker C–X bond)"],
["Why aryl and vinyl halides resist substitution","Partial double-bond character and sp² carbon; ortho/para nitro groups activate SNAr"],
["Making alkyl halides from alcohols","SOCl₂ (best, gaseous by-products); HX/ZnCl₂; free radical halogenation of alkanes"],
["Substitution versus elimination","Alcoholic KOH, bulky base and heat favour E2; aqueous KOH favours substitution"],
["Fittig and Wurtz–Fittig","Fittig: 2ArX + 2Na → Ar–Ar. Wurtz–Fittig: ArX + RX + 2Na → Ar–R"],
["DDT, chloroform, freons","DDT: non-biodegradable insecticide. CHCl₃ oxidises to phosgene in light (store in dark bottles). Freons deplete ozone"],
["Stereochemistry of SN reactions","SN2: inversion (Walden). SN1: racemisation"]
],
"Alcohols, Phenols & Ethers": [
["Oxidation of alcohols","PCC: 1° → aldehyde. K₂Cr₂O₇/H⁺: 1° → acid, 2° → ketone; 3° resists"],
["Reactions of phenol","Br₂ water gives 2,4,6-tribromophenol; neutral FeCl₃ gives violet colour; more acidic than alcohols"],
["Hydration of alkenes","H₂O/H⁺: Markovnikov. Hydroboration–oxidation (B₂H₆ then H₂O₂/OH⁻): anti-Markovnikov"],
["Cleavage of ethers with HI","Smaller alkyl gets I (SN2) unless 3° (SN1); aryl alkyl ethers give phenol + alkyl iodide"],
["Boiling point order","Alcohols > isomeric ethers and alkanes (H bonding); branching lowers boiling point"],
["Dehydration of ethanol","Conc. H₂SO₄ at 443 K gives ethene; at 413 K gives diethyl ether"],
["Vicinal diols","Pinacol–pinacolone rearrangement with acid; periodic acid cleaves 1,2-diols"],
["Preparation of phenol","Cumene process (cumene → hydroperoxide → phenol + acetone); Dow process; hydrolysis of diazonium salts"]
],
"Carbonyls & Acids": [
["Nucleophilic addition to C=O","Nu⁻ attacks planar sp² carbon → tetrahedral alkoxide → protonation; aldehydes beat ketones (less steric hindrance)"],
["Haloform reaction","Methyl ketones or CH₃CH(OH)– with X₂/NaOH → CHX₃ + carboxylate"],
["Reducing agents for carbonyl compounds","NaBH₄ reduces aldehydes/ketones only; LiAlH₄ also reduces acids and esters"],
["Acidity of acids versus phenols","RCOOH > H₂CO₃ > phenol; only carboxylic acids liberate CO₂ from NaHCO₃"],
["Esterification and saponification","Fischer: RCOOH + R′OH ⇌ ester (H⁺, reversible). Saponification with NaOH is irreversible"],
["Perkin and Claisen–Schmidt","Perkin: ArCHO + (RCH₂CO)₂O/RCH₂COONa → cinnamic acid. Claisen–Schmidt: ArCHO + ketone, base"],
["Tests for carbonyl groups","2,4-DNP: orange ppt with aldehydes and ketones; Tollens/Fehling: aldehydes only; iodoform: methyl ketones"],
["Making acyl chlorides","RCOOH + SOCl₂ (SO₂ and HCl escape)"],
["Benzaldehyde versus aliphatic aldehydes","Benzaldehyde: no Fehling test, gives Cannizzaro and benzoin condensation"]
],
"Amines": [
["Basicity order of methylamines","Gas phase: 3° > 2° > 1° > NH₃. Aqueous: 2° > 1° > 3° > NH₃"],
["Reduction of nitrobenzene","Sn/HCl or Fe/HCl: aniline; Zn/NH₄Cl: phenylhydroxylamine; alkaline medium: azoxy, azo, hydrazo"],
["Replacement of the diazonium group","CuX (Sandmeyer), Cu/HX (Gattermann), KI gives I, H₃PO₂ gives H, HBF₄ then heat gives F (Balz–Schiemann)"],
["Reactions of aniline","Acetylation moderates activation; Br₂ water gives 2,4,6-tribromoaniline; protect –NH₂ before nitration"],
["Test for primary aromatic amines","Diazotise (NaNO₂/HCl, 0–5 °C) and couple with β-naphthol: orange-red dye"],
["Ammonolysis of alkyl halides","Gives a mixture of 1°, 2°, 3° amines and quaternary salt; excess NH₃ favours 1°"]
],
"Biomolecules, Polymers & Everyday Chem": [
["Reducing versus non-reducing sugars","Glucose, fructose, maltose, lactose reduce; sucrose does not"],
["Peptide bond and essential amino acids","–CO–NH– linkage; essential ones (valine, leucine, lysine, etc.) are not made by the body"],
["Denaturation of proteins","Loss of secondary and tertiary structure by heat or pH; primary sequence intact"],
["Vitamin solubility","Fat soluble: A, D, E, K. Water soluble: B complex, C (needed daily)"],
["Addition polymers","Polythene (ethene); PVC (vinyl chloride); Teflon (tetrafluoroethene); PAN (acrylonitrile); polystyrene (styrene)"],
["Condensation polymers","Nylon-6,6, terylene, Bakelite, melamine–formaldehyde; PHBV is biodegradable"],
["Antiseptics versus disinfectants","Antiseptics on living tissue (dettol, tincture of iodine, 0.2% phenol); disinfectants on non-living objects (1% phenol)"],
["Analgesics, tranquilisers, antibiotics","Narcotic (morphine); non-narcotic (aspirin, paracetamol); tranquilisers (equanil); broad-spectrum antibiotic chloramphenicol"],
["Preservatives and sweeteners","Sodium benzoate preserves food; aspartame (unstable on cooking), saccharin, sucralose sweeten"],
["Soaps and detergents classes","Detergents: anionic (SLS), cationic (cetyltrimethylammonium bromide), non-ionic"],
["DNA versus RNA","DNA: deoxyribose, double helix, thymine. RNA: ribose, single strand, uracil; mRNA, tRNA, rRNA"]
]
},
M: {
"Sets, Relations & Functions": [
["Number of subsets","2ⁿ subsets; 2ⁿ − 1 non-empty; 2ⁿ − 2 proper non-empty"],
["De Morgan's laws for sets","(A ∪ B)′ = A′ ∩ B′; (A ∩ B)′ = A′ ∪ B′"],
["Types of relation","Reflexive aRa; symmetric aRb ⇒ bRa; transitive; equivalence needs all three"],
["Counting relations on n elements","Reflexive: 2^{n(n−1)}; symmetric: 2^{n(n+1)/2}"],
["One-one and onto","One-one: f(a) = f(b) ⇒ a = b; onto: range = codomain; bijective needs both"],
["Composition and inverse","(f∘g)(x) = f(g(x)); (f∘g)⁻¹ = g⁻¹∘f⁻¹; inverse exists only for bijections"],
["Even and odd function algebra","even×even = even; odd×odd = even; even×odd = odd; f(x) + f(−x) is even"],
["Domain rules","√f needs f ≥ 0; log f needs f > 0; 1/f needs f ≠ 0; sin⁻¹f needs |f| ≤ 1"],
["Period of combined functions","Period of f + g: LCM of periods; f(ax + b): T/|a|"],
["Inclusion–exclusion for three sets","n(A∪B∪C) = ΣnA − Σn(A∩B) + n(A∩B∩C)"]
],
"Complex Numbers": [
["nth roots of unity","e^{2πik/n}; sum is 0; product is (−1)^{n−1}"],
["Rotation using complex numbers","Multiplying by e^{iθ} rotates by θ about the origin; (z₂ − z₀)/(z₁ − z₀) captures rotation about z₀"],
["Square root of a + ib","±[√((|z| + a)/2) + i·sgn(b)√((|z| − a)/2)]"],
["Collinear and perpendicular conditions","Collinear: (z₃ − z₁)/(z₂ − z₁) real; perpendicular: purely imaginary"],
["Apollonius circle","|z − z₁| = k|z − z₂| with k ≠ 1 is a circle; |z − z₀| = r is a circle centred z₀"],
["Argument properties","Principal arg in (−π, π]; arg z̄ = −arg z; arg(1/z) = −arg z"],
["Properties of ω","ω² = ω̄ = 1/ω; 1 + ω + ω² = 0; (1 + ω)² = −ω"],
["Cos from exponentials","cosθ = (e^{iθ} + e^{−iθ})/2; |e^{iθ}| = 1"]
],
"Quadratic Equations": [
["Condition for a common root","(c₁a₂ − c₂a₁)² = (a₁b₂ − a₂b₁)(b₁c₂ − b₂c₁)"],
["Location of roots","Both roots > k: D ≥ 0, af(k) > 0, −b/2a > k. Roots on either side of k: af(k) < 0"],
["Sign of a quadratic","D < 0: always sign of a; between roots opposite to a; outside roots same as a"],
["Symmetric functions of roots","α² + β² = (α+β)² − 2αβ; α³ + β³ = (α+β)³ − 3αβ(α+β)"],
["Conjugate pairs","With real coefficients, complex roots come in conjugate pairs; with rational coefficients, surd roots too"],
["Roots when ac < 0","Real, distinct and of opposite sign"]
],
"Sequences & Series": [
["Arithmetico-geometric series","S∞ = a/(1 − r) + dr/(1 − r)²"],
["Harmonic progression","Reciprocals form an AP; HM of a, b = 2ab/(a + b)"],
["Telescoping sums","Σ1/(r(r+1)) = n/(n+1); Σ1/(r(r+1)(r+2)) = n(n+3)/(4(n+1)(n+2))"],
["Convenient terms in a GP","Three terms a/r, a, ar; product of terms equidistant from the ends is constant"],
["Inserting means","n AMs: d = (b − a)/(n + 1). n GMs: r = (b/a)^{1/(n+1)}; product of the GMs = (ab)^{n/2}"],
["Sum of odd and even numbers","First n odd numbers n²; first n even numbers n(n + 1)"],
["Method of differences","If T_r = V_r − V_{r−1} then S_n = V_n − V_0"]
],
"Permutations & Combinations": [
["Dividing into groups","Unequal groups: n!/(a!b!c!). k equal groups of m: n!/((m!)^k k!)"],
["Arrangements with repeated letters","n!/(p!q!r!…)"],
["Rank of a word","Count smaller words letter by letter using factorials"],
["Diagonals and triangles in a polygon","Diagonals n(n − 3)/2; triangles ⁿC₃ from vertices"],
["Non-adjacent arrangements","Choose r gaps: ⁿ⁻ʳ⁺¹C_r ways for r items among n with none adjacent"],
["Sum of numbers from digits","Sum of all n-digit numbers from n distinct digits: (n − 1)!·(Σdigits)·(111…1, n ones)"],
["Circular permutations of necklaces","(n − 1)! clockwise-distinct; (n − 1)!/2 when flipping is allowed"],
["Onto functions","For two target elements: 2^m − 2 surjections from an m-element set"]
],
"Binomial Theorem": [
["Even and odd coefficient sums","Sum of even-indexed = sum of odd-indexed coefficients = 2^{n−1}"],
["Greatest binomial coefficient","ⁿC_r largest at r = n/2 (n even) or r = (n ± 1)/2 (n odd)"],
["Binomial series for any index","(1 + x)^n = 1 + nx + n(n−1)x²/2! + … for |x| < 1"],
["Useful sum identities","Σ r·ⁿC_r = n·2^{n−1}; Σ r²·ⁿC_r = n(n+1)2^{n−2}"],
["Vandermonde identity","Σ ᵐC_r·ⁿC_{k−r} = ᵐ⁺ⁿC_k"],
["Coefficient in (1 − x)^(−n)","Coefficient of x^r is ⁿ⁺ʳ⁻¹C_r"],
["Sum of (a + b)ⁿ and (a − b)ⁿ","2[ⁿC₀aⁿ + ⁿC₂aⁿ⁻²b² + …] (even terms only)"]
],
"Trigonometry": [
["Standard angle values","sin: 0, ½, 1/√2, √3/2, 1 at 0°, 30°, 45°, 60°, 90°; cos reversed; tan 0, 1/√3, 1, √3, ∞"],
["ASTC and reduction formulae","All, Sin, Tan, Cos positive in quadrants I to IV; sin(π − θ) = sinθ; cos(π + θ) = −cosθ"],
["Range of a sinθ + b cosθ","[−√(a² + b²), √(a² + b²)]"],
["Heights and distances","tanθ = height/horizontal distance; angle of elevation equals angle of depression (alternate angles)"],
["Exact values of 18° and 36°","sin18° = (√5 − 1)/4; cos36° = (√5 + 1)/4"],
["Half-angle formulae in a triangle","tan(A/2) = √[(s−b)(s−c)/(s(s−a))]; sin(A/2) = √[(s−b)(s−c)/bc]"],
["Sum of sines in AP","Σ sin(α + kβ) = sin(nβ/2)/sin(β/2) · sin(α + (n−1)β/2)"],
["Difference and cosine compound angles","sin(A − B) = sinA cosB − cosA sinB; cos(A ± B) = cosA cosB ∓ sinA sinB"],
["Triple product identity","sinA sin(60° − A) sin(60° + A) = ¼ sin3A; cosA cos(60° − A) cos(60° + A) = ¼ cos3A"],
["Identities when A + B + C = π","tanA + tanB + tanC = tanA tanB tanC; cosA + cosB + cosC = 1 + 4 sin(A/2) sin(B/2) sin(C/2)"],
["Circumradius and inradius","R = abc/4Δ; r = Δ/s; r = 4R sin(A/2) sin(B/2) sin(C/2)"],
["Ambiguous case of the sine rule","Given a, b, A: 0, 1 or 2 triangles depending on b sinA versus a"]
],
"Inverse Trigonometry": [
["Principal values of sec⁻¹, cosec⁻¹, cot⁻¹","sec⁻¹: [0, π] − {π/2}; cosec⁻¹: [−π/2, π/2] − {0}; cot⁻¹: (0, π)"],
["Negative arguments","sin⁻¹(−x) = −sin⁻¹x; cos⁻¹(−x) = π − cos⁻¹x; tan⁻¹(−x) = −tan⁻¹x"],
["sin(sin⁻¹x) versus sin⁻¹(sin x)","sin(sin⁻¹x) = x for |x| ≤ 1; sin⁻¹(sin x) = x only for x ∈ [−π/2, π/2]"],
["Forms of 2 tan⁻¹x","sin⁻¹(2x/(1+x²)) = cos⁻¹((1−x²)/(1+x²)) = tan⁻¹(2x/(1−x²)) (in their valid ranges)"],
["Difference of arctangents","tan⁻¹x − tan⁻¹y = tan⁻¹((x − y)/(1 + xy)) if xy > −1"],
["Three arctangents summing to π","tan⁻¹x + tan⁻¹y + tan⁻¹z = π ⇒ x + y + z = xyz"]
],
"Matrices & Determinants": [
["Determinant properties","Swapping rows flips the sign; identical rows give 0; R_i + kR_j changes nothing; scaling one row scales det"],
["Area of triangle by determinant","½|x₁ y₁ 1; x₂ y₂ 1; x₃ y₃ 1|; collinear if the determinant is 0"],
["Special matrices","Orthogonal AAᵀ = I; idempotent A² = A; involutory A² = I; nilpotent Aᵏ = 0"],
["Consistency of AX = B","|A| ≠ 0: unique. |A| = 0 and (adj A)B = 0: infinite. |A| = 0 and (adj A)B ≠ 0: none"],
["Inverse of products","(AB)⁻¹ = B⁻¹A⁻¹; (Aᵀ)⁻¹ = (A⁻¹)ᵀ"],
["Skew-symmetric matrix of odd order","Its determinant is 0"],
["Minors and cofactors","Cᵢⱼ = (−1)^{i+j}Mᵢⱼ; expansion along any row gives |A|; with another row's cofactors gives 0"],
["Trace and eigenvalues","Trace = Σλ and |A| = Πλ"]
],
"Limits & Continuity": [
["Standard limits","tan x/x → 1; (1 − cos x)/x² → ½; (aˣ − 1)/x → ln a"],
["Sandwich theorem","If g ≤ f ≤ h and lim g = lim h = L then lim f = L"],
["Indeterminate forms","1^∞: e^{lim f·g}; ∞ − ∞: rationalise; 0·∞: rewrite as 0/0"],
["Continuity and differentiability","LHL = RHL = f(a); differentiable ⇒ continuous but |x| at 0 shows the converse fails"],
["Intermediate value theorem","A continuous f on [a, b] takes every value between f(a) and f(b)"],
["Limits of (1 + 1/n)ⁿ and ln(1+x)/x","e and 1"],
["Greatest integer and modulus limits","Evaluate left and right limits separately; [x] jumps at integers"],
["Series shortcuts for limits","sin x ≈ x − x³/6; cos x ≈ 1 − x²/2; eˣ ≈ 1 + x + x²/2; ln(1 + x) ≈ x − x²/2"]
],
"Differentiation & Applications": [
["Logarithmic differentiation","For y = f^g: dy/dx = y(g′ ln f + g f′/f)"],
["Other standard derivatives","(√x)′ = 1/(2√x); (cot x)′ = −cosec²x; (cosec x)′ = −cosec x cot x; (sinh x)′ = cosh x"],
["Second derivative of a parametric curve","d²y/dx² = [d(dy/dx)/dt]/(dx/dt)"],
["Monotonicity","f′ > 0 increasing; f′ < 0 decreasing; critical points where f′ = 0 or undefined"],
["Standard optimisation results","Rectangle of fixed perimeter: square is max area. Cylinder in sphere: h = 2R/√3. Cone in sphere: h = 4R/3"],
["Related rates","Differentiate with respect to time: dV/dt = (dV/dr)(dr/dt)"],
["Tangent, normal, subtangent","Tangent y − y₁ = m(x − x₁); normal slope −1/m; subtangent y/m; subnormal ym"],
["Angle between curves","tanθ = |(m₁ − m₂)/(1 + m₁m₂)| at the point of intersection"],
["Derivative of an inverse function","(f⁻¹)′(y) = 1/f′(x)"],
["Approximation by differentials","Δy ≈ f′(x)Δx; f(x + h) ≈ f(x) + h f′(x)"]
],
"Integration": [
["Integrals of tan, cot, sec, cosec","ln|sec x|; ln|sin x|; ln|sec x + tan x|; ln|tan(x/2)|"],
["∫ √(x² + a²) dx","(x/2)√(x² + a²) + (a²/2) ln|x + √(x² + a²)| + C"],
["Integrals of sin²x, cos²x","x/2 − sin2x/4; x/2 + sin2x/4"],
["Standard substitutions","∫f′/f = ln|f|; ∫f′·fⁿ = f^{n+1}/(n+1); ∫dx/(x ln x) = ln|ln x|"],
["Partial fractions set-up","Linear A/(x−a); repeated A/(x−a) + B/(x−a)²; irreducible quadratic (Ax + B)/(x² + px + q)"],
["Reflection properties of definite integrals","∫ₐᵇ f(x)dx = ∫ₐᵇ f(a + b − x)dx; ∫₀^{2a} f = ∫₀ᵃ [f(x) + f(2a − x)]dx"],
["Leibniz rule","d/dx ∫_{g(x)}^{h(x)} f(t)dt = f(h)h′ − f(g)g′"],
["Limit of a sum","lim (1/n) Σ f(r/n) = ∫₀¹ f(x)dx"],
["∫₀^{π/2} sin x/(sin x + cos x) dx","π/4 by King's property"],
["∫ dx/(sin²x cos²x)","tan x − cot x + C"]
],
"Differential Equations": [
["Variable separable","Write dy/g(y) = f(x)dx and integrate both sides"],
["Exact equations","M dx + N dy = 0 is exact if ∂M/∂y = ∂N/∂x"],
["Newton's law of cooling as a DE","dT/dt = −k(T − Tₛ) gives T = Tₛ + (T₀ − Tₛ)e^{−kt}"],
["Forming a differential equation","Differentiate as many times as there are arbitrary constants, then eliminate them"],
["Growth and decay","dN/dt = kN gives N = N₀e^{kt}"],
["Linear DE in x","dx/dy + Px = Q; IF = e^{∫P dy}"],
["Orthogonal trajectories","Replace dy/dx by −dx/dy in the DE of the family"]
],
"Straight Lines & Circles": [
["Section formula and centroid","Internal division ((mx₂ + nx₁)/(m + n), …); centroid = average of vertices"],
["Forms of a straight line","y = mx + c; point–slope; two-point; intercept x/a + y/b = 1; normal x cosα + y sinα = p"],
["Triangle centres","Incentre ((ax₁ + bx₂ + cx₃)/(a + b + c), …); centroid divides orthocentre–circumcentre line 2:1"],
["Angle bisectors","(a₁x + b₁y + c₁)/√(a₁² + b₁²) = ±(a₂x + b₂y + c₂)/√(a₂² + b₂²)"],
["Pair of lines ax² + 2hxy + by² = 0","tanθ = 2√(h² − ab)/|a + b|; perpendicular if a + b = 0; coincident if h² = ab"],
["Family of circles","S₁ + λS₂ = 0 through the intersection of two circles; S + λL = 0 with a line"],
["Orthogonal circles","2g₁g₂ + 2f₁f₂ = c₁ + c₂; common chord S₁ − S₂ = 0"],
["Chord of contact","T = 0: xx₁ + yy₁ + g(x + x₁) + f(y + y₁) + c = 0; tangent length √S₁"],
["Relative position of two circles","d > r₁+r₂ separate; = external tangent; between intersect; d = |r₁−r₂| internal tangent"],
["Reflection of a point in a line","(x, y) − 2(ax + by + c)(a, b)/(a² + b²)"]
],
"Conic Sections": [
["Parametric points","Ellipse (a cosθ, b sinθ); hyperbola (a secθ, b tanθ); parabola (at², 2at)"],
["Focal distance properties","Ellipse: sum of focal distances 2a. Hyperbola: difference 2a. Parabola: distance to focus = distance to directrix"],
["Normal to y² = 4ax","y = mx − 2am − am³; at (at², 2at): y + tx = 2at + at³"],
["Chord with a given midpoint","T = S₁ for any conic"],
["Eccentricities","Parabola 1; ellipse < 1; hyperbola > 1; circle 0; rectangular hyperbola √2"],
["Latus rectum and directrices","Ellipse and hyperbola latus rectum 2b²/a; directrices x = ±a/e"],
["Auxiliary circle","x² + y² = a² for the ellipse x²/a² + y²/b² = 1"],
["Reflection properties","Parabola: focal rays leave parallel to the axis. Ellipse: a ray through one focus passes through the other"],
["Polar of a point","The polar of (x₁, y₁) with respect to a conic is T = 0"]
],
"Vectors & 3D Geometry": [
["Section formula in vectors","Internal division m:n: (n·a + m·b)/(m + n)"],
["Line through two points","Direction ratios (x₂ − x₁, y₂ − y₁, z₂ − z₁); symmetric form (x − x₁)/a = (y − y₁)/b = (z − z₁)/c"],
["Forms of the plane","ax + by + cz + d = 0; intercept x/a + y/b + z/c = 1; normal form r·n̂ = d"],
["Angle between planes","cosθ = |n₁·n₂|/(|n₁||n₂|)"],
["Plane through the intersection of two planes","P₁ + λP₂ = 0"],
["Coplanar lines","(a₂ − a₁)·(b₁ × b₂) = 0"],
["Image of a point in a plane","Foot = P − ((ax₁ + by₁ + cz₁ + d)/(a² + b² + c²))(a, b, c); image is twice that offset"],
["Volume of a tetrahedron","(1/6)|[a b c]|"],
["Projection and unit vector","â = a/|a|; component of a along b = (a·b)/|b|"],
["Dot and cross product rules","a·b = b·a; a × b = −b × a; a·(a × b) = 0; i × j = k, j × k = i, k × i = j"],
["Distance between parallel lines in 3D","|(a₂ − a₁) × b|/|b|"]
],
"Probability & Statistics": [
["Addition theorem","P(A ∪ B) = P(A) + P(B) − P(A ∩ B); P(A′) = 1 − P(A)"],
["Independent versus mutually exclusive","Independent: P(A ∩ B) = P(A)P(B). Mutually exclusive: P(A ∩ B) = 0 (not the same thing)"],
["Total probability","P(A) = ΣP(Eᵢ)P(A|Eᵢ)"],
["Mean deviation and a variance result","Mean deviation = Σ|xᵢ − x̄|/n; variance of 1, 2, …, n = (n² − 1)/12"],
["Empirical relation of averages","Mode = 3 Median − 2 Mean"],
["Effect of shifting and scaling","Var(ax + b) = a²Var(x); SD scales by |a|; mean shifts by b"],
["Binomial mean versus variance","Mean np > variance npq"],
["Standard sample spaces","Two dice: 36 outcomes (sum 7: 6); n coins: 2ⁿ; deck: 52 cards, 13 per suit"],
["Combined variance of two groups","σ² = [n₁(σ₁² + d₁²) + n₂(σ₂² + d₂²)]/(n₁ + n₂), d = group mean − combined mean"]
],
"Mathematical Reasoning": [
["Negation, converse, contrapositive","¬(p ⇒ q) = p ∧ ¬q; converse q ⇒ p; contrapositive ¬q ⇒ ¬p is equivalent to the original"],
["De Morgan's laws in logic","¬(p ∧ q) = ¬p ∨ ¬q; ¬(p ∨ q) = ¬p ∧ ¬q"],
["Truth tables of implication and biconditional","p ⇒ q is false only for p true, q false; p ⇔ q is true when both match"],
["Tautology and contradiction","Tautology: always true (p ∨ ¬p). Contradiction: always false (p ∧ ¬p)"],
["Negating quantifiers","¬(∀x P) = ∃x ¬P; ¬(∃x P) = ∀x ¬P"]
]
}
};
window.flashSeed = window.flashSeed || [];
const seen = new Set(window.flashSeed.map(r => r[0] + '|' + r[1]));
let added = 0;
Object.keys(D).forEach(s => Object.keys(D[s]).forEach(ch => D[s][ch].forEach(p => {
  const k = s + '|' + p[0]; if (seen.has(k)) return; seen.add(k);
  window.flashSeed.push([s, p[0], p[1], ch]); added++;
})));
window.flashSeedAdded = (window.flashSeedAdded || 0) + added;
})();

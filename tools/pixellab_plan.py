"""PixelLab generation plan. 36 planned single-image requests; 4 of 40 kept for corrections.
The 24 game instruments have individual models and valid grid footprints.
No credentials belong in this file or elsewhere in the repository.
"""
from dataclasses import dataclass
from pathlib import Path

BASE_PALETTE="vivid arcade palette: plum purple #48365e, warm amber #f5b758, mint teal #63d6bd, rose #ec739c, cream #fff2d7, navy outlines #251c39"
STYLE=("Premium 16-bit console pixel art asset for a cheerful musical merge puzzle game, "
       "hand-placed pixel clusters, coherent upper-left lighting, crisp intentional outline, "
       "rich readable material shading, no gradients, no blurry antialiasing, "
       "true low-resolution pixel art, carefully harmonized colors, "
       + BASE_PALETTE + ". ")
VIEW=("Single completely visible object, orthographic straight frontal product view, "
      "exactly centered, natural proportions, generous transparent padding, "
      "no text, lettering, logos, ground, platform, scene, borders or other objects. ")
@dataclass(frozen=True)
class Asset:
    name:str; family:str; level:int; w:int; h:int; spec:str
    @property
    def size(self):return (self.w*64,self.h*64)
    @property
    def ui(self):return self.family=="ui"
    @property
    def prompt(self):
        if self.ui:
            return STYLE+self.spec+" Game-ready tileable or isolated UI element, no letters, words or labels."
        return STYLE+VIEW+self.spec
assets=[
Asset("keyboard_1","keys",1,1,1,"Tiny beginner orange mini synthesizer with eight piano keys, one black tone knob, three colorful retro push buttons, warm shiny body; simple cheerful entry-level construction."),
Asset("keyboard_2","keys",2,1,1,"Distinct upgraded compact lavender analog keyboard synth, wider raised casing, two black dials, four jewel-colored pads, ten ivory piano keys, little display, not the same shape as beginner synth."),
Asset("keyboard_3","keys",3,2,1,"Wide indigo two-octave polysynth, additional rows of faders and knobs, expressive colorful pads, rectangular chassis with rounded stepped corners, much wider than tier 2."),
Asset("keyboard_4","keys",4,2,1,"Elegant teal stage keyboard with two layered control decks and large keys, luminous digital LCD, dual oscillator modules, metallic trim, notably redesigned professional synth."),
Asset("keyboard_5","keys",5,2,2,"Premium stacked dual-manual stage synthesizer on compact custom X stand, two clearly separate piano keyboards, patch bay, colorful equipment, deep violet and gold luxury finish."),
Asset("keyboard_6","keys",6,2,2,"Legendary futuristic triple-deck synth console, three distinguishable rows of keyboards, floating-style layered angled panels but front-on camera, gilded side frames, mint illuminated pads, complex concert instrument."),
Asset("ukulele_1","ukulele",1,1,1,"Small four-string natural wood soprano ukulele with round sound hole, very short fretted neck, exactly four tuning pegs, simple warm finish, slender waist, full instrument fits."),
Asset("ukulele_2","ukulele",2,1,1,"Distinct concert-size four-string honeywood ukulele, longer decorated fretboard, herringbone rim, two-tone dark spruce top, unique deeper waist, polished body."),
Asset("ukulele_3","ukulele",3,1,2,"Solid mahogany tenor ukulele with substantially longer neck, abalone sound-hole rosette, cutaway upper horn, ornate pearl fret markers, exactly four strings, elaborate finish."),
Asset("ukulele_4","ukulele",4,1,2,"Premium electric-acoustic four-string ukulele, distinct slim cutaway body and pickup controls, dark blue glossy body, cream bindings, longer fretboard."),
Asset("ukulele_5","ukulele",5,1,2,"Luxury resonator-style ukulele, unique brushed bronze resonator disc inside sculpted mahogany body, decorated peghead, rich inlay, precise four strings and four tuning pegs."),
Asset("ukulele_6","ukulele",6,1,2,"Legendary futuristic four-string ukulele, unmistakable sculpted asymmetric amethyst crystal body, gold hardware and distinct thin glowing turquoise pickups, refined intricate detail."),
Asset("drums_1","drums",1,1,1,"Minimal cheerful orange beginner drum kit with EXACTLY one bass drum, one small mounted tom and one gold cymbal on its stand, three clear components, no extra drums."),
Asset("drums_2","drums",2,2,2,"Classic rock drum set, one large amber bass drum, two mounted toms, floor tom at side, two golden cymbals, chrome stands, detailed shell woodgrain and realistic drumheads."),
Asset("drums_3","drums",3,2,2,"Upgraded indigo rock drum set, oversized kick bass drum, three rack toms, a separate snare, two floor toms, three cymbals, intricate chrome hardware, noticeably expanded footprint."),
Asset("drums_4","drums",4,2,2,"Professional aqua-blue fusion drum kit with double bass pedals and six blue-gradient drums, hi-hat, crash and ride cymbals and complex support stands, symmetrical concert composition."),
Asset("drums_5","drums",5,3,2,"Massive modern violet double-kick arena drum setup, eight drums of differing sizes, elaborate cymbal rack with five bronze cymbals, golden hardware and throne silhouette, widescreen design."),
Asset("drums_6","drums",6,3,2,"Legendary futuristic symphonic percussion mega-rig: dual bass drums, layered banks of electric toms and acoustic toms, multiple iridescent cymbals, large curved golden frame, visually spectacular complex setup."),
Asset("guitar_1","guitar",1,1,2,"Classic cherry-red single-cutaway electric six-string guitar, Les Paul silhouette, gold knobs and trim, two humbucker pickups, glossy lacquer, distinctive heavy rounded body."),
Asset("guitar_2","guitar",2,1,2,"Distinct sapphire-blue double-cutaway SG-style electric six-string guitar with pronounced twin pointed horns, chrome pickups and tuners, completely different silhouette from level 1."),
Asset("guitar_3","guitar",3,1,2,"Emerald green modern Stratocaster-inspired offset-contour six-string electric guitar, three slim single-coil pickups, white pickguard, ergonomic double horns, slim different headstock."),
Asset("guitar_4","guitar",4,1,2,"Luxurious plum-purple offset jazzmaster electric guitar, dramatic asymmetric waist and two broad soapbar pickups, brushed champagne bridge, separate pickup selector, distinct body shape."),
Asset("guitar_5","guitar",5,1,2,"Aggressive angular metallic bronze flying V six-string electric guitar with long V-shaped body, locking tremolo and sculpted pointy headstock, unmistakably different silhouette."),
Asset("guitar_6","guitar",6,1,2,"Legendary futuristic crystalline electric six-string guitar, sharp streamlined asymmetric sculpted cyan and amethyst body, dual luminous pickups, precision gold hardware, extraordinary bespoke design."),
Asset("background_tile","ui",0,1,1,"Seamless 64x64 decorative lavender arcade room-floor texture, soft purple square checker tiles and sparse tiny glints, subdued so game objects remain visible, flat full-bleed square background without focal object."),
Asset("cell","ui",0,1,1,"One square raised game board slot tile, ornate beveled amethyst bezel and dark center, readable at 64x64, polished candy arcade user interface, full-bleed square."),
Asset("metal_block","ui",0,1,1,"Single square steel damage target tile with polished metallic silver bevel, four circular corner screws and flat dark graphite inset for overlaying HP text, no text or digits."),
Asset("boss_block","ui",0,2,2,"Large lavish square ornate boss target game tile, thick layered golden riveted square frame and vivid ruby-red enamel center for overlaying HP numbers, luxurious arcade reward quality, no text."),
Asset("scanner","ui",0,1,1,"Narrow vertical turquoise scanner energy stripe effect, mint bright pixelated central line with stepped square particles and sparkles, otherwise transparent, fits inside narrow vertical lane."),
Asset("charge_button","ui",0,2,1,"Wide landscape green mint and gold chunky arcade button background sprite, ornate pixelated beveled golden edge, jade-green inset and shiny highlights, blank central area for overlaying a number, no text."),
Asset("settings_icon","ui",0,1,1,"Single ornate small silver gear cog centered on transparent background, bright ivory highlight, plum shadow, cheerful pixel UI style."),
Asset("shop_icon","ui",0,1,1,"Single beautifully shaded pink-magenta fantasy upgrade gem, faceted diamond silhouette, polished golden setting, transparent background, no text."),
Asset("pause_icon","ui",0,1,1,"Single stylish pause symbol composed of two vertical pale gold polished bars inside a violet square pixel-art bezel, transparent outer background."),
Asset("result_panel","ui",0,2,1,"Landscape empty decorative victory panel background, luxurious peach-gold ornamental beveled frame and plum-purple inset surface with ample room for game text, no text."),
Asset("coin","ui",0,1,1,"Single richly detailed round golden currency coin with abstract star relief, thick embossed metallic rim and white glint, isolated transparent background, no words or numbers."),
Asset("sparkle","ui",0,1,1,"Single small four-point retro pixel sparkle, icy mint central cross with cream brightest glint and dark violet silhouette, transparent background."),
]
assert len(assets)==36
assert len([a for a in assets if not a.ui])==24
UI_NAMES=[a.name for a in assets if a.ui]
OLD_ORDER=["keyboard_1","keyboard_2","ukulele_1","drums_1","drums_2","guitar_1","guitar_2"]
BY_NAME={x.name:x for x in assets}
ADDITIONS=[x.name for x in assets if not x.ui and x.name not in OLD_ORDER]
ORDER=OLD_ORDER+ADDITIONS
assert len(ORDER)==24
def expected_paths(root:Path):
    return [root/(x.name+".png") for x in assets]

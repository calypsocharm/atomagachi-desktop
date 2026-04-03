from PIL import Image, ImageFilter

# Open the original user uploaded sketch
img = Image.open(r"C:\Users\Calyp\.gemini\antigravity\brain\18aa1e50-6d92-43ed-848e-0ac5b649f11d\media__1775238610755.png").convert("RGBA")
base_w, base_h = img.size

# The image has 4 cats. Let's crop the bottom left cat, which looks like it's solidly grounded.
# Adjusting these coordinates purely by estimation: bottom left quadrant
left = 0
top = base_h // 2
right = base_w // 2
bottom = base_h
cat_crop = img.crop((left, top, right, bottom))

pixels = cat_crop.load()
w, h = cat_crop.size

# Threshold: remove white/light background to transparent
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        # Calculate luminance
        lum = (r + g + b) / 3
        
        # If it's light (background), make it transparent
        if lum > 200:
            pixels[x, y] = (0, 0, 0, 0)
        else:
            # Darken the silhouette so it resembles a shadowy creature
            # Darken by multiplying current darkness factor
            darkness_factor = lum / 255.0
            new_val = int(50 * darkness_factor)
            pixels[x, y] = (new_val, new_val, int(new_val*1.5), 255) # slight blue hue to the shadow

# Now add a neon outline effect:
# We will create a larger canvas, generate a blurred mask tinted purple/blue, and compose it behind the cat.
outline_color = (139, 92, 246, 255) # Purple-Blue neon glow
glow_radius = 8

glow_img = Image.new("RGBA", (w + glow_radius*4, h + glow_radius*4), (0,0,0,0))
glow_img.paste(cat_crop, (glow_radius*2, glow_radius*2), cat_crop)

# Convert the cat shape to a solid block of color for the glow
r, g, b, a = glow_img.split()
solid_glow = Image.merge("RGBA", (
    r.point(lambda p: outline_color[0] if p > 0 else 0),
    g.point(lambda p: outline_color[1] if p > 0 else 0),
    b.point(lambda p: outline_color[2] if p > 0 else 0),
    a
))

# Blur it aggressively to make it a thick glowing aura
blurred_glow = solid_glow.filter(ImageFilter.GaussianBlur(glow_radius))

# And an inner sharper border for the extreme edge
sharp_glow = solid_glow.filter(ImageFilter.GaussianBlur(2))

# Composite them: Blur + Sharp + Actual Cat
final_img = Image.alpha_composite(Image.new("RGBA", blurred_glow.size, (0,0,0,0)), blurred_glow)
final_img = Image.alpha_composite(final_img, sharp_glow)

# Finally paste the actual cat shape back in the center
final_img.paste(cat_crop, (glow_radius*2, glow_radius*2), cat_crop)

final_img.save("cat_sprite.png")
print("Sprite beautifully extracted and neon-outlined!")

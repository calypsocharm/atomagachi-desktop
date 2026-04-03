from PIL import Image

# Open the AI generated image!
img = Image.open(r"C:\Users\Calyp\.gemini\antigravity\brain\18aa1e50-6d92-43ed-848e-0ac5b649f11d\neon_cat_sprite_1775240278703.png").convert("RGBA")
pixels = img.load()
w, h = img.size

# Make pure white / very light backgrounds completely transparent
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        lum = (r + g + b) / 3
        # If it's pure white background, make transparent
        if r > 240 and g > 240 and b > 240:
            pixels[x, y] = (0, 0, 0, 0)

# The AI image already has an incredible neon aura, we just needed to remove the white canvas it generated it on!
img.save("cat_sprite.png")
print("AI Sprite white background removed successfully.")

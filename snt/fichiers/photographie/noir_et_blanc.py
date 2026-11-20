from PIL import Image
img = Image.open("image.jpg")
largeur_image=950
hauteur_image=540
for y in range(hauteur_image):
    for x in range(largeur_image):
        r,v,b=img.getpixel((x,y))
        gris = int(0.2125 * r + 0.7154 * v + 0.0721 * b)
        img.putpixel((x,y),(gris,gris,gris))
img.show()

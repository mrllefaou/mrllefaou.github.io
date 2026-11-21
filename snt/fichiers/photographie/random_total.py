from PIL import Image
from random import randint
img = Image.open("image.jpg")
largeur_image=960
hauteur_image=540
for y in range(hauteur_image):
    for x in range(largeur_image):
        img.putpixel((x,y),(randint(0,255),randint(0,255),randint(0,255)))
img.show()

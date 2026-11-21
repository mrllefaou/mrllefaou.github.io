from PIL import Image
img = Image.open("image.jpg")
largeur_image=950
hauteur_image=540
for y in range(hauteur_image):
    for x in range(largeur_image):
        r,v,b=img.getpixel((x,y))
        img.putpixel((x,y),(255-r,255-v,255-b))
img.show()

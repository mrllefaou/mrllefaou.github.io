from PIL import Image
img = Image.open("image.jpg")
largeur_image=950
hauteur_image=540
for y in range(hauteur_image):
    for x in range(largeur_image):
        r,v,b=img.getpixel((x,y))
        n_r=v
        n_v=b
        n_b=r
        img.putpixel((x,y),(n_r,n_v,n_b))
img.show()

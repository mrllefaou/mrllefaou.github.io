from PIL import Image

img = Image.open("batman.png")
taille=img.size
img=img.resize((int(taille[0]/2.0),int(taille[1]/2.0)),Image.LANCZOS)

background = Image.open("image.jpg")
background.paste(img, (350, 100), img)
background.show()

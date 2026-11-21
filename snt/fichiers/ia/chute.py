# Modélisation de la chute d'un objet lâché sans vitesse initiale
# Axe vertical orienté vers le BAS : y = distance parcourue depuis le point de lâcher (en m)

g = 9.81        # intensité de la pesanteur (m/s²)
h = 20.0        # hauteur de chute (m)
dt = 0.01       # pas de temps (s)
k_sur_m = 0.0  # frottement de l'air (m⁻¹) ; 0 = pas de frottement

t = 0.0         # temps (s)
v = 0.0         # vitesse (m/s)
y = 0.0         # distance parcourue (m)

temps = [t]
vitesses = [v]
distances = [y]

while y < h:
    a = g - k_sur_m * v * v     # accélération (m/s²)
    v = v + a * dt              # nouvelle vitesse
    y = y + v * dt              # nouvelle position
    t = t + dt                  # nouveau temps
    temps.append(t)
    vitesses.append(v)
    distances.append(y)

print("Durée de la chute :", round(t, 2), "s")
print("Vitesse à l'arrivée :", round(v, 1), "m/s, soit", round(v * 3.6), "km/h")

# Tracé des résultats avec matplotlib (à ajouter à la fin du programme précédent)
import matplotlib.pyplot as plt

plt.plot(temps, vitesses)
plt.xlabel("temps (s)")
plt.ylabel("vitesse (m/s)")
plt.title("Vitesse d'un objet lâché")
plt.grid(True)
plt.show()

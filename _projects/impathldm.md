---
layout: page
title: "Improved Latent Diffusion Models"
description: "Tracking positional movement of Wild-type Zebrafish (Danio Rerio) to examine behavioural patterns using Computer Vision."
description: "Improving text-conditioned latent diffusion models for breast cancer histopathology in a large scale cohort."
img: assets/img/projects/impathldm/imgs.png
importance: 1
category: work
---

Aakash M. Rao [1], Debayan Gupta [1]

### Affiliations:
1. Department of Psychology, Ashoka University

### Aim
The development of generative models in the past decade has allowed for hyperrealistic data synthesis. While potentially beneficial, this synthetic data generation process has been relatively underexplored in cancer histopathology. One algorithm for synthesising a realistic image is diffusion; it iteratively converts an image to noise and learns the recovery process from this noise [Wang and Vastola, 2023]. While effective, it is highly computationally expensive for high-resolution images, rendering it infeasible for histopathology. The development of Variational Autoencoders (VAEs) has allowed us to learn the representation of complex high-resolution images in a latent space. A vital by-product of this is the ability to compress high-resolution images to space and recover them lossless. The marriage of diffusion and VAEs allows us to carry out diffusion in the latent space of an autoencoder, enabling us to leverage the realistic generative capabilities of diffusion while maintaining reasonable computational requirements. Rombach et al. [2021b] and Yellapragada et al. [2023] build foundational models for this task, paving the way to generate realistic histopathology images. In this paper, we discuss the pitfalls of current methods, namely [Yellapragada et al., 2023] and resolve critical errors while proposing improvements along the way. Our methods achieve an FID score of 21.11, beating its SOTA counterparts in [Yellapragada et al., 2023] by 1.2 FID, while presenting a train-time GPU memory usage reduction of 7%.

### My Role
I was the primary researcher in this project. I handled the entire research process under the guidance of Dr. Dabayan Gupta

### An illustration of the work
<div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/fishtrack/raw-fish.gif" title="Un-tracked movement" class="img-fluid rounded z-depth-1" %}
</div>
<div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/projects/fishtrack/tracked-fish.gif" title="Tracked movement" class="img-fluid rounded z-depth-1" %}
</div>

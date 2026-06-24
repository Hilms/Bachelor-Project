# LingVis-Based Annotation & Exploration Tool (Bachelor Thesis Extension)

## Overview

This project is a **web-based extension of the LingVis framework**, developed as part of a bachelor thesis.

LingVis is a research system for computational analysis of political debates, combining NLP-based feature extraction with visual analytics techniques. It provides a pipeline for extracting linguistic features such as sentiment, named entities, topics, POS tags, and dialog-related measures.

This project builds on top of LingVis by introducing a **fully automatic annotation and exploration tool** that combines close and distant reading techniques to support linguistic analysis workflows.

The main objective is to improve the early stage of text analysis by reducing manual annotation effort and enabling interactive exploration of precomputed linguistic features.

---

## My Contribution

This work extends the LingVis framework with a **web-based analytical interface and interaction layer** that supports:

- Automatic integration of precomputed linguistic features into a unified annotation system
- Interactive annotation and visualization of micro-linguistic features
- Combined close reading and distant reading exploration workflow
- Development of a pixel-based visualization for document-level overview
- Implementation of a glyph-based comparison matrix for utterance analysis
- Filtering, segmentation, and navigation mechanisms for annotated texts
- Linking between overview visualizations and detailed text views
- Full backend integration via REST API (Java Maven-based service)
- Dockerization of the backend environment for reproducible execution

The system is designed to support analysts in exploring political debates by combining local (text-level) and global (document-level) perspectives.

---

## System Context

This project is built on top of the existing LingVis framework.

- **LingVis provides:**
  - NLP feature extraction (sentiment, POS, topics, NER, etc.)
  - Data processing pipeline
  - Backend services and data storage integration

- **This project adds:**
  - A new interactive web-based analysis application
  - Visualization components for close and distant reading
  - Feature-driven annotation and exploration workflows
  - UI-driven filtering and navigation mechanisms

---

## Architecture

The system follows a **client-server architecture**:

- **Backend:** Java (Spring Boot REST service)
- **Frontend:** Web-based UI (LingVis-integrated extension)
- **Data Storage:** MongoDB (provided by LingVis environment)
- **Communication:** REST API between frontend and backend

---

## Key Concepts

### Close Reading
Detailed exploration of text with inline annotations for:
- Sentiment
- POS tags
- Named entities
- Topics
- Dialogue quality measures
- Speaker attribution

### Distant Reading
Aggregated visual representations supporting global analysis:
- Pixel-based document overview
- Glyph matrix for utterance comparison
- Word cloud for frequency analysis
- Detached visualization views

### Interaction Design
- Filtering by speaker, topic, or feature type
- Search and navigation within annotated text
- Linking between overview and detailed text location
- Multi-level exploration workflow (overview → detail → interpretation)

---

## Technologies

- Java (Spring Boot)
- RESTful APIs
- JavaScript (AngularJS) with D3.js for web-based visualizations
- MongoDB (external dependency from the LingVis framework)

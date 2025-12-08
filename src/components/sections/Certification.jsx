import React, { useRef } from "react";
import styled from "styled-components";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Container = styled.div`
  width: 100%;
  min-height: 100vh;                /* fills the viewport */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 1100px;
  gap: 2px;
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const Title = styled.div`
  font-size: 52px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 32px;
  }
`;
const Desc = styled.div`
  font-size: 18px;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Gallery = styled.section`
  height: 60vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  
`;

const GalleryTrack = styled.div`
  display: flex;
  gap: 4rem;
  align-items: center;
`;

const GalleryItem = styled.div`
  flex: 0 0 auto;
  width: 700px;              /* fixed frame width */
  height: 400px;             /* fixed frame height */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;          /* hide overflow when using object-fit: cover */
  border-radius: 24px;

  transform-origin: center center;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  @media (max-width: 768px) {
    width: 300px;              /* fixed frame width */
    height: 250px; 
  }


`;
const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;   /* fills 700x400, may crop slightly */
  display: block;
`;

const Certification = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(containerRef);
      const track = q(".gallery-track")[0];
      const items = q(".gallery-item");

      if (!track || !items.length) return;

      // --- 1. Scale logic stays the same ---
      const updateScales = () => {
        const viewportCenter = window.innerWidth / 2;
        const maxDist = viewportCenter;

        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.left + rect.width / 2;
          const dist = Math.abs(viewportCenter - itemCenter);

          let ratio = dist / maxDist;
          if (ratio > 1) ratio = 1;

          const maxScale = 1.2;
          const minScale = 0.8;
          const scale = maxScale - (maxScale - minScale) * ratio;

          gsap.to(item, {
            scale,
            duration: 0.2,
            overwrite: true,
          });

          if (ratio < 0.15) item.classList.add("is-active");
          else item.classList.remove("is-active");
        });
      };

      // --- 2. Compute startX (first image centered) & endX (last image centered) ---
      const getPositions = () => {
        // clear any previous x so measurements are correct
        gsap.set(track, { x: 0 });

        const viewportCenter = window.innerWidth / 2;
        const first = items[0];
        const last = items[items.length - 1];

        const firstRect = first.getBoundingClientRect();
        const lastRect = last.getBoundingClientRect();

        const firstCenter = firstRect.left + firstRect.width / 2;
        const lastCenter = lastRect.left + lastRect.width / 2;

        // how much to move the track so that item center == viewport center
        const startX = viewportCenter - firstCenter;
        const endX = viewportCenter - lastCenter;

        return { startX, endX };
      };

      const positions = getPositions();
      const horizontalDistance = Math.abs(positions.endX - positions.startX);

      // --- 3. Horizontal scroll from "first centered" -> "last centered" ---
      const tween = gsap.fromTo(
        track,
        { x: positions.startX },
        {
          x: positions.endX,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,          // whole Certifications section
            start: "top top",
            end: "+=" + horizontalDistance,         // scroll length mapped to that movement
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: updateScales,
          },
        }
      );

      // keep scales correct when ScrollTrigger refreshes (resize etc.)
      ScrollTrigger.addEventListener("refresh", () => {
        const pos = getPositions();
        tween.vars.x = pos.endX;
        tween.invalidate();      // make GSAP re-read start/end values
        updateScales();
      });

      updateScales();

      return () => {
        ScrollTrigger.removeEventListener("refresh", updateScales);
        tween.scrollTrigger && tween.scrollTrigger.kill();
        tween.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <Container id="Certification" ref={containerRef}>
      <Wrapper>
        <Title>Certifications</Title>
        <Desc style={{ marginBottom: "40px" }}>
          My Ongoing Investment: Demonstrating Up-to-Date Technical Competencies.
        </Desc>
      <Gallery>
        <GalleryTrack className="gallery-track">
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600651/Coursera_E72A7LRDXJRS_Introduction_to_Data_Science_kbrsmp.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600650/Coursera_Visualisation_umgdxb.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600649/Coursera_96WJ2NZWM7G7_Applied_Machine_Learning_y8lvqf.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600650/Coursera_applied_text_mining_kfrezj.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600650/Coursera_applied_social_network_analysis_uxsure.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600651/UC-bfd7fa0f-b442-46f1-ac79-2c181ec59372_ojpt1r.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600654/web_developer_bootcamp_kdidmc.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600652/Coursera_data_scientist_yjgwvu.jpg" />
            </GalleryItem>
            <GalleryItem className="gallery-item">
              <GalleryImage src="https://res.cloudinary.com/du1xovgrr/image/upload/v1764600651/UC-e7feb060-3b0f-43f8-88f7-2394a2213156_ofg2pq.jpg" />
            </GalleryItem>
          </GalleryTrack>
      </Gallery>
      </Wrapper>
    </Container>
  );
};


export default Certification;

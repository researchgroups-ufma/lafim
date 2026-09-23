/**
 * EquipmentCard — Card de equipamento com Morphing Dialog
 *
 * Usa o MorphingDialog do Motion Primitives para criar uma transição
 * fluida entre o card fechado e o modal expandido.
 *
 * Estado fechado: foto, nome e descrição breve.
 * Ao clicar: expande com animação morphing mostrando foto grande,
 * descrição completa, fabricante e modelo.
 *
 * Props:
 *   title        — nome do equipamento (obrigatório)
 *   summary      — descrição breve exibida no card (obrigatório)
 *   description  — descrição completa exibida no modal (opcional)
 *   photo        — caminho da foto em /uploads/ (opcional)
 *   manufacturer — fabricante do equipamento (opcional)
 *   model        — modelo do equipamento (opcional)
 */

"use client";

import { motion } from "framer-motion";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
  MorphingDialogImage,
} from "@/components/motion-primitives/morphing-dialog";

type EquipmentCardProps = {
  title: string;
  summary: string;
  description?: string;
  photo?: string;
  manufacturer?: string;
  model?: string;
};

export default function EquipmentCard({
  title,
  summary,
  description,
  photo,
  manufacturer,
  model,
}: EquipmentCardProps) {
  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.3,
      }}
    >
      {/* ── Card fechado (trigger) ─────────────────────────────────────────── */}
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ height: "100%" }}
      >
      <MorphingDialogTrigger
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "0.5rem",
          overflow: "hidden",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          transition: "border-color 0.2s ease",
        }}
        className="structure-card"
      >
        {/* Foto ou placeholder */}
        <div
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            backgroundColor: "var(--color-bg-subtle)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photo ? (
            <MorphingDialogImage
              src={photo}
              alt={title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ fontSize: "2rem", opacity: 0.3 }}>⚙</span>
              <span style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)" }}>
                Sem foto
              </span>
            </div>
          )}
        </div>

        {/* Informações do card */}
        <div style={{ padding: "1.25rem" }}>
          <MorphingDialogTitle
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "0.4rem",
            }}
          >
            {title}
          </MorphingDialogTitle>

          <MorphingDialogSubtitle
            style={{
              fontSize: "0.82rem",
              color: "var(--color-text-muted)",
              fontWeight: 300,
              lineHeight: 1.5,
              marginBottom: "0.75rem",
            }}
          >
            {summary}
          </MorphingDialogSubtitle>

          {/* Fabricante e modelo */}
          {(manufacturer || model) && (
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-subtle)" }}>
              {[manufacturer, model].filter(Boolean).join(" · ")}
            </p>
          )}

          <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "0.75rem" }}>
            Ver detalhes →
          </p>
        </div>
      </MorphingDialogTrigger>
      </motion.div>

      {/* ── Modal expandido ───────────────────────────────────────────────── */}
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "0.75rem",
            width: "min(640px, 90vw)",
            maxHeight: "85vh",
            // ancora o MorphingDialogClose, que é `absolute`, no modal —
            // sem isso ele se prende ao container fixo e vai para o canto da tela
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Só este bloco rola: o Close fica ancorado no Content, que não
              rola, e assim continua visível no canto durante a leitura. */}
          <div style={{ overflowY: "auto" }}>
          {/* Foto grande */}
          {photo && (
            <MorphingDialogImage
              src={photo}
              alt={title}
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: "0.75rem 0.75rem 0 0",
              }}
            />
          )}

          {/* Conteúdo do modal */}
          <div style={{ padding: "1.75rem" }}>

            {/* Título */}
            <MorphingDialogTitle
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 500,
                color: "var(--color-text)",
                marginBottom: "0.25rem",
              }}
            >
              {title}
            </MorphingDialogTitle>

            {/* Fabricante e modelo */}
            {(manufacturer || model) && (
              <MorphingDialogSubtitle
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-primary)",
                  marginBottom: "1.25rem",
                }}
              >
                {[manufacturer, model].filter(Boolean).join(" · ")}
              </MorphingDialogSubtitle>
            )}

            {/* Linha divisória */}
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "var(--color-border)",
                marginBottom: "1.25rem",
              }}
            />

            {/* Descrição completa */}
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit:    { opacity: 0, y: 20 },
              }}
            >
              {description ? (
                description.split("\n\n").map((paragraph) => (
                  <p
                    key={paragraph}
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.8,
                      color: "var(--color-text-muted)",
                      fontWeight: 300,
                      marginBottom: "0.85rem",
                    }}
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-subtle)" }}>
                  {summary}
                </p>
              )}
            </MorphingDialogDescription>
          </div>

          </div>

          {/* Botão fechar — canto superior direito do modal */}
          <MorphingDialogClose className="modal-close" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

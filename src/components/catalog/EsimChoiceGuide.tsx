import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import styles from "./EsimDestinationExplorer.module.css";

const steps = [
  {
    number:
      1,
    title:
      "Bạn đi đâu?",
    description:
      "Chọn quốc gia hoặc khu vực",
  },
  {
    number:
      2,
    title:
      "Đi bao nhiêu ngày?",
    description:
      "Chọn thời gian dự kiến sử dụng",
  },
  {
    number:
      3,
    title:
      "Dùng Internet nhiều hay ít?",
    description:
      "Chọn nhu cầu sử dụng",
  },
] as const;

export function EsimChoiceGuide() {
  return (
    <section
      aria-labelledby="esim-choice-guide-title"
      className={
        styles.choiceGuide
      }
    >
      <div
        className={
          styles.choiceIntro
        }
      >
        <h2
          id="esim-choice-guide-title"
          className={
            styles.choiceIntroTitle
          }
        >
          Bạn chưa biết chọn gói nào?
        </h2>

        <p
          className={
            styles.choiceIntroDescription
          }
        >
          Trả lời 3 câu hỏi, YSim sẽ gợi ý gói eSIM phù hợp nhất cho hành trình của bạn.
        </p>
      </div>

      {
        steps.map(
          (
            step,
          ) => (
            <article
              key={
                step.number
              }
              className={
                styles.stepCard
              }
            >
              <span
                className={
                  styles.stepNumber
                }
              >
                {
                  step.number
                }
              </span>

              <h3
                className={
                  styles.stepTitle
                }
              >
                {
                  step.title
                }
              </h3>

              <p
                className={
                  styles.stepDescription
                }
              >
                {
                  step.description
                }
              </p>
            </article>
          ),
        )
      }

      <Link
        href="/destinations"
        className={
          styles.choiceCta
        }
      >
        Bắt đầu ngay

        <ArrowRight
          aria-hidden="true"
          className="h-4 w-4"
        />
      </Link>
    </section>
  );
}

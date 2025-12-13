export interface IUnjumblePuzzle {
  id: string;
  jumbled: string;
  question?: string;
}

export interface IUnjumbleCheckAnswerRequest {
  questionId: string;
  answer: string;
}

export interface IUnjumbleCheckAnswerResponse {
  isCorrect: boolean;
  score: number;
  status: boolean;
  message: string;
}

export interface IUnjumbleJson {
  score_per_sentence: number;
  is_randomized: boolean;
  sentences: {
    sentence_text: string;
    sentence_image: string | null;
  }[];
}

export interface IUpdateUnjumbleSentence {
  sentence_text: string;
  sentence_image_array_index?: number | string;
}

export interface IUpdateUnjumble {
  thumbnail_image?: File;
  files_to_upload?: File[];
  score_per_sentence?: number;
  is_randomized?: boolean;
  sentences?: IUpdateUnjumbleSentence[];
  name?: string;
  description?: string;
  is_publish_immediately?: boolean;
}

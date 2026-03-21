import chayNifasImg from "@/assets/chay-nifas.jpeg";
import coffretImg from "@/assets/coffret-aliaa.jpeg";
import guideImg from "@/assets/guide-utilisation.jpeg";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  heroImage?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string;
  price: number;
  description: string;
  longDescription: string;
  materials: string;
  dimensions?: string;
  images: string[];
  featured?: boolean;
  new?: boolean;
}

export const collections: Collection[] = [
  {
    id: "tisanes",
    name: "Tisanes",
    slug: "tisanes",
    description: "Mélanges de plantes naturelles pour le bien-être féminin",
    image: chayNifasImg,
    heroImage: chayNifasImg,
  },
  {
    id: "superaliments",
    name: "Superaliments",
    slug: "superaliments",
    description: "Poudres et préparations naturelles pour la vitalité",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1920&q=80",
  },
  {
    id: "coffrets",
    name: "Coffrets",
    slug: "coffrets",
    description: "Coffrets cadeaux avec une sélection de nos meilleurs produits",
    image: coffretImg,
    heroImage: coffretImg,
  },
  {
    id: "nouveautes",
    name: "Nouveautés",
    slug: "nouveautes",
    description: "Les dernières additions à notre collection",
    image: "https://images.unsplash.com/photo-1515694346937-94d85e39d29c?w=800&q=80",
    heroImage: "https://images.unsplash.com/photo-1515694346937-94d85e39d29c?w=1920&q=80",
  },
];

export const products: Product[] = [
  // Tisanes
  {
    id: "chay-nifas",
    name: "Chay Nifas",
    slug: "chay-nifas",
    collection: "tisanes",
    price: 18,
    description: "Mélange de plantes naturelles pour le post-partum",
    longDescription: "Chay Nifas est un mélange traditionnel de plantes naturelles soigneusement sélectionnées pour accompagner les femmes après l'accouchement. Préparation traditionnelle, sans conservateurs. Infusez dans un verre d'eau chaude, laissez infuser 5 à 10 minutes puis dégustez.",
    materials: "Plantes naturelles 100% biologiques",
    dimensions: "Poids net : 80 g",
    images: [
      chayNifasImg,
      coffretImg,
    ],
    featured: true,
  },
  {
    id: "msakhen",
    name: "Msakhen",
    slug: "msakhen",
    collection: "tisanes",
    price: 22,
    description: "Mélange réchauffant selon la recette traditionnelle",
    longDescription: "Le Msakhen est une préparation traditionnelle à base de plantes réchauffantes. Préparé selon la recette traditionnelle ancestrale, ce mélange se consomme avec du miel ou du lait. Sans conservateurs, préparation artisanale.",
    materials: "Mélange de plantes naturelles",
    dimensions: "Poids net : 120 g",
    images: [
      coffretImg,
      chayNifasImg,
    ],
    new: true,
  },
  {
    id: "tashinas",
    name: "Tashinas",
    slug: "tashinas",
    collection: "tisanes",
    price: 20,
    description: "Mélange de plantes pour le bien-être quotidien",
    longDescription: "Tashinas est un mélange de plantes sélectionnées pour leurs vertus bienfaisantes au quotidien. Préparation traditionnelle sans conservateurs, à infuser dans de l'eau chaude pour une tisane apaisante et réconfortante.",
    materials: "Mélange de plantes naturelles",
    dimensions: "Poids net : 120 g",
    images: [
      chayNifasImg,
      guideImg,
    ],
    featured: true,
  },
  // Superaliments
  {
    id: "talbina",
    name: "Talbina",
    slug: "talbina",
    collection: "superaliments",
    price: 15,
    description: "Farine d'orge traditionnelle pour la santé digestive",
    longDescription: "La Talbina est une préparation ancestrale à base de farine d'orge, reconnue pour ses bienfaits sur la digestion et le bien-être général. Mélangez une cuillère avec un verre de lait chaud et consommez une fois par jour. Sans conservateurs, préparation 100% naturelle.",
    materials: "Farine d'orge naturelle",
    dimensions: "Poids net : 50 g",
    images: [
      coffretImg,
      guideImg,
    ],
  },
  {
    id: "graines-nigelle",
    name: "Graines de Nigelle",
    slug: "graines-de-nigelle",
    collection: "superaliments",
    price: 12,
    description: "Graines de nigelle pures pour le système immunitaire",
    longDescription: "Les graines de nigelle, aussi appelées habba sawda, sont utilisées depuis des millénaires pour leurs propriétés exceptionnelles. Consommez une cuillère à café par jour avec du miel pour renforcer votre système immunitaire naturellement.",
    materials: "Graines de nigelle 100% pures",
    dimensions: "Poids net : 100 g",
    images: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
      chayNifasImg,
    ],
    new: true,
  },
  // Coffrets
  {
    id: "coffret-decouverte",
    name: "Coffret Découverte",
    slug: "coffret-decouverte",
    collection: "coffrets",
    price: 65,
    description: "Le coffret complet avec nos 4 produits phares",
    longDescription: "Notre Coffret Découverte réunit les 4 produits emblématiques d'ALIAA Natural Care : Chay Nifas, Msakhen, Tashinas et Talbina. Présenté dans un élégant coffret vert avec guide d'utilisation inclus. Le cadeau parfait pour prendre soin de soi ou offrir à une personne chère.",
    materials: "4 produits + guide d'utilisation multilingue",
    images: [
      coffretImg,
      guideImg,
    ],
    featured: true,
  },
  {
    id: "coffret-tisanes",
    name: "Coffret Duo Tisanes",
    slug: "coffret-duo-tisanes",
    collection: "coffrets",
    price: 35,
    description: "Duo de nos meilleures tisanes en coffret cadeau",
    longDescription: "Le Coffret Duo Tisanes associe deux de nos tisanes les plus appréciées dans un écrin élégant. Idéal pour découvrir l'univers ALIAA ou pour offrir un moment de bien-être naturel.",
    materials: "2 tisanes au choix + coffret",
    images: [
      coffretImg,
      chayNifasImg,
    ],
  },
  // Nouveautés
  {
    id: "huile-argan",
    name: "Huile d'Argan Pure",
    slug: "huile-argan-pure",
    collection: "nouveautes",
    price: 28,
    description: "Huile d'argan cosmétique pressée à froid",
    longDescription: "Notre Huile d'Argan est extraite par pression à froid des noix d'arganier du Maroc. Riche en vitamine E et en acides gras essentiels, elle nourrit la peau et les cheveux en profondeur. Usage cosmétique, 100% pure et naturelle.",
    materials: "Huile d'argan 100% pure, pressée à froid",
    dimensions: "50 ml",
    images: [
      "https://images.unsplash.com/photo-1515694346937-94d85e39d29c?w=800&q=80",
      chayNifasImg,
    ],
    new: true,
  },
];

export const getProductsByCollection = (collectionSlug: string): Product[] => {
  return products.filter((product) => product.collection === collectionSlug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((product) => product.featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter((product) => product.new);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((product) => product.slug === slug);
};

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return collections.find((collection) => collection.slug === slug);
};

export const getRelatedProducts = (productId: string, limit = 4): Product[] => {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  
  return products
    .filter((p) => p.collection === product.collection && p.id !== productId)
    .slice(0, limit);
};

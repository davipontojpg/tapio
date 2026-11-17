import { DatabaseSchema } from "@/types/menu";

export const INITIAL_SEED_DATA: DatabaseSchema = {
  restaurants: [
    {
      id: "rest-bella-napoli",
      slug: "bella-napoli",
      name: "Cantina & Pizzaria Bella Napoli",
      segment: "Pizzaria & Cantina Italiana",
      tagline: "Massas frescas e pizzas de fermentação natural 48h no forno a lenha",
      description:
        "Tradição italiana desde 2014 com farinha 00 importada, tomates San Marzano e carta selecionada de vinhos.",
      logoUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      primaryColor: "#c2410c",
      themeMode: "light",
      status: "active",
      monthlyFee: 89.9,
      ownerName: "Marco Bellini",
      ownerPhone: "5511999991111",
      ownerPin: "1234",
      allowOwnerEdit: true,
      address: "Rua das Oliveiras, 412 - Jardins",
      city: "São Paulo - SP",
      openingHours: "Terça a Domingo • 18h00 às 23h30",
      isOpenNow: true,
      wifiSsid: "BellaNapoli_Clientes",
      wifiPassword: "fornoalenha48h",
      instagram: "@bellanapolicantina",
      serviceFeeNotice: "Taxa de serviço opcional de 10%. Couvert artístico às sextas e sábados: R$ 15,00 por pessoa.",
      highlightBanner: "🍷 Happy Hour até 20h: Taça de Chianti ou Aperol Spritz em dobro na mesa!",
      createdAt: "2026-10-12T14:00:00.000Z",
      categories: [
        {
          id: "cat-bn-1",
          name: "Entradas & Antipasti",
          description: "Para compartilhar enquanto a pizza vai ao forno",
          order: 1,
        },
        {
          id: "cat-bn-2",
          name: "Pizzas Artesanais",
          description: "Massa de fermentação natural 48h — Média (6 fatias) ou Grande (8 fatias)",
          order: 2,
        },
        {
          id: "cat-bn-3",
          name: "Massas Frescas",
          description: "Produzidas diariamente na nossa cozinha",
          order: 3,
        },
        {
          id: "cat-bn-4",
          name: "Vinhos & Bebidas",
          description: "Rótulos selecionados, drinks autorais e sodas italianas",
          order: 4,
        },
        {
          id: "cat-bn-5",
          name: "Sobremesas",
          description: "Dolci clássicos feitos na casa",
          order: 5,
        },
      ],
      items: [
        {
          id: "item-bn-1",
          categoryId: "cat-bn-1",
          name: "Burrata Cremosa ao Pesto",
          description:
            "Burrata fresca inteira servida com tomates cereja confitados, pesto genovês da casa e focaccia quentinha do forno a lenha.",
          price: 54.0,
          imageUrl:
            "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
          available: true,
          featured: true,
          badges: ["popular", "vegetarian"],
          serves: "Serve 2 pessoas",
        },
        {
          id: "item-bn-2",
          categoryId: "cat-bn-1",
          name: "Bruschetta Clássica Pomodoro (4 un.)",
          description:
            "Pão italiano tostado na brasa com alho confitado, tomate italiano em cubos, manjericão fresco e azeite extra virgem.",
          price: 34.0,
          imageUrl:
            "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["vegan"],
          serves: "4 unidades",
        },
        {
          id: "item-bn-3",
          categoryId: "cat-bn-2",
          name: "Margherita Verace DOP",
          description:
            "Molho de tomate pelati San Marzano, mozzarella fior di latte fresca, folhas de manjericão gigante e fio de azeite italiano.",
          price: 58.0,
          imageUrl:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
          available: true,
          featured: true,
          badges: ["popular", "vegetarian"],
          variations: [
            { id: "var-bn-3m", label: "Média (6 fatias)", price: 58.0 },
            { id: "var-bn-3g", label: "Grande (8 fatias)", price: 76.0 },
          ],
          addonsInfo: "Opcional na mesa: Borda recheada com Catupiry (+R$ 14) ou Calabresa (+R$ 16).",
        },
        {
          id: "item-bn-4",
          categoryId: "cat-bn-2",
          name: "Parma & Rúcula Selvagem",
          description:
            "Fior di latte, presunto cru italiano maturado 18 meses, rúcula fresca, lascas de Grana Padano e redução suave de aceto balsâmico.",
          price: 68.0,
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
          available: true,
          featured: true,
          badges: ["chef"],
          variations: [
            { id: "var-bn-4m", label: "Média (6 fatias)", price: 68.0 },
            { id: "var-bn-4g", label: "Grande (8 fatias)", price: 89.0 },
          ],
          addonsInfo: "Pode ser pedida meio a meio com qualquer sabor tradicional.",
        },
        {
          id: "item-bn-5",
          categoryId: "cat-bn-2",
          name: "Diavola Calabresa Picante",
          description:
            "Molho pelati, mozzarella de búfala, salame picante tipo pepperoni artesanal, pimenta dedo-de-moça caramelizada e mel trufado.",
          price: 64.0,
          imageUrl:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["spicy", "new"],
          variations: [
            { id: "var-bn-5m", label: "Média (6 fatias)", price: 64.0 },
            { id: "var-bn-5g", label: "Grande (8 fatias)", price: 84.0 },
          ],
        },
        {
          id: "item-bn-6",
          categoryId: "cat-bn-3",
          name: "Tagliatelle al Tartufo & Funghi",
          description:
            "Massa artesanal fresca envolvida em creme suave de Grana Padano, mix de cogumelos salteados e azeite de trufas negras.",
          price: 74.0,
          imageUrl:
            "https://images.unsplash.com/photo-1621996346565-e3d3a9f3e76a?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["chef", "vegetarian"],
          serves: "Prato individual",
        },
        {
          id: "item-bn-7",
          categoryId: "cat-bn-3",
          name: "Lasagna alla Bolognese da Nonna",
          description:
            "Camadas finas de massa verde de espinafre, ragu de carne cozido por 6 horas, molho bechamel cremoso e gratinado no forno a lenha.",
          price: 69.0,
          imageUrl:
            "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular"],
          serves: "Prato individual bem servido",
        },
        {
          id: "item-bn-8",
          categoryId: "cat-bn-4",
          name: "Chianti Classico DOCG (Toscana)",
          description:
            "Vinho tinto seco de corpo médio, notas de cereja madura e especiarias. Perfeito com pizzas vermelhas e massas ao ragu.",
          price: 36.0,
          imageUrl:
            "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["chef"],
          variations: [
            { id: "var-bn-8t", label: "Taça (150ml)", price: 36.0 },
            { id: "var-bn-8g", label: "Garrafa (750ml)", price: 148.0 },
          ],
        },
        {
          id: "item-bn-9",
          categoryId: "cat-bn-4",
          name: "Soda Italiana Artesanal",
          description:
            "Água com gás gelada, xarope artesanal da casa e ramo de alecrim fresco. Sabores: Maçã Verde, Frutas Vermelhas ou Limão Siciliano.",
          price: 18.0,
          imageUrl:
            "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular", "gluten_free"],
        },
        {
          id: "item-bn-10",
          categoryId: "cat-bn-5",
          name: "Cannoli Siciliani (2 unidades)",
          description:
            "Massa crocante recheada na hora com creme leve de ricota doce, raspas de laranja cristalizada e pistache torrado.",
          price: 32.0,
          imageUrl:
            "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular"],
        },
        {
          id: "item-bn-11",
          categoryId: "cat-bn-5",
          name: "Tiramisù Clássico da Casa",
          description:
            "Biscoito savoiardi embebido em espresso italiano, creme aerado de mascarpone e cacau belga polvilhado.",
          price: 34.0,
          imageUrl:
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
          available: false,
          badges: ["chef"],
        },
      ],
    },
    {
      id: "rest-brasa-burger",
      slug: "brasa-burger",
      name: "Brasa & Co. Burger",
      segment: "Hamburgueria & Chopp Artesanal",
      tagline: "Blends altos grelhados na parrilla a carvão + Chopp gelado na caneca zero grau",
      description:
        "Carnes Angus frescas moídas diariamente, pão brioche selado na manteiga e molhos defumados exclusivos.",
      logoUrl:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1200&q=80",
      primaryColor: "#d97706",
      themeMode: "dark",
      status: "active",
      monthlyFee: 79.9,
      ownerName: "Lucas Ferreira",
      ownerPhone: "5511988882222",
      ownerPin: "2026",
      allowOwnerEdit: true,
      address: "Av. Paulista, 1890 - Bela Vista",
      city: "São Paulo - SP",
      openingHours: "Todos os dias • 17h30 às 00h00",
      isOpenNow: true,
      wifiSsid: "BrasaCo_5G",
      wifiPassword: "brasa2026",
      instagram: "@brasacoburger",
      serviceFeeNotice: "Taxa de serviço opcional de 10%. Peça o ponto da carne ao garçom (ao ponto, mal passada ou bem passada).",
      highlightBanner: "🔥 Quinta da Brasa: Qualquer Chopp IPA 500ml por R$ 18 na mesa!",
      createdAt: "2026-10-20T18:00:00.000Z",
      categories: [
        {
          id: "cat-bb-1",
          name: "Para Abrir o Apetite",
          description: "Porções crocantes para dividir com a galera",
          order: 1,
        },
        {
          id: "cat-bb-2",
          name: "Burgers na Parrilla",
          description: "Escolha Simples (160g) ou Duplo (320g) — todos acompanham maionese da casa",
          order: 2,
        },
        {
          id: "cat-bb-3",
          name: "Chopps & Drinks",
          description: "Torneiras artesanais e coquetéis clássicos",
          order: 3,
        },
        {
          id: "cat-bb-4",
          name: "Milkshakes",
          description: "Batidos na hora com sorvete artesanal",
          order: 4,
        },
      ],
      items: [
        {
          id: "item-bb-1",
          categoryId: "cat-bb-1",
          name: "Fritas Rústicas Trufadas & Parmesão",
          description:
            "Batatas cortadas à mão com casca, fritas até dourar, finalizadas com azeite de trufas, alecrim crocante e parmesão ralado.",
          price: 34.0,
          imageUrl:
            "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular", "vegetarian"],
          serves: "Serve 2 a 3 pessoas",
        },
        {
          id: "item-bb-2",
          categoryId: "cat-bb-2",
          name: "Brasa Classic Cheddar & Bacon",
          description:
            "Burger Angus na brasa, duplo cheddar inglês derretido, bacon defumado em tiras grossas, cebola caramelizada e maionese defumada no brioche.",
          price: 42.0,
          imageUrl:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
          available: true,
          featured: true,
          badges: ["popular"],
          variations: [
            { id: "var-bb-2s", label: "Simples (160g)", price: 42.0 },
            { id: "var-bb-2d", label: "Duplo (320g)", price: 54.0 },
          ],
          addonsInfo: "Adicionais para pedir ao garçom: Fritas individuais (+R$ 12) | Ovo caipira (+R$ 5).",
        },
        {
          id: "item-bb-3",
          categoryId: "cat-bb-2",
          name: "Smoked Gorgonzola & Mel Picante",
          description:
            "Hambúrguer 180g selado no carvão, creme de queijo gorgonzola suave, rúcula fresca, cebola crispy e fio de mel com pimenta calabresa.",
          price: 46.0,
          imageUrl:
            "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
          available: true,
          featured: true,
          badges: ["chef", "spicy"],
          variations: [
            { id: "var-bb-3s", label: "Simples (180g)", price: 46.0 },
            { id: "var-bb-3d", label: "Duplo (360g)", price: 59.0 },
          ],
        },
        {
          id: "item-bb-4",
          categoryId: "cat-bb-2",
          name: "Green Smash Plant (Vegetariano)",
          description:
            "Burger artesanal de cogumelos portobello e grão-de-bico grelhado, queijo prato, picles da casa, tomate e alface americana no pão australiano.",
          price: 39.0,
          imageUrl:
            "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["vegetarian", "new"],
        },
        {
          id: "item-bb-5",
          categoryId: "cat-bb-3",
          name: "Chopp Session IPA Artesanal",
          description:
            "Refrescante, aromático com notas cítricas de maracujá e amargor equilibrado. Servido na caneca congelada.",
          price: 16.0,
          imageUrl:
            "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular"],
          variations: [
            { id: "var-bb-5p", label: "350ml", price: 16.0 },
            { id: "var-bb-5g", label: "500ml", price: 22.0 },
          ],
        },
        {
          id: "item-bb-6",
          categoryId: "cat-bb-3",
          name: "Moscow Mule da Brasa",
          description:
            "Vodka premium, suco fresco de limão tahiti, xarope de gengibre picante e espuma cremosa artesanal de gengibre.",
          price: 34.0,
          imageUrl:
            "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["chef"],
        },
        {
          id: "item-bb-7",
          categoryId: "cat-bb-4",
          name: "Milkshake de Nutella & Avelã (400ml)",
          description:
            "Sorvete de creme artesanal batido com Nutella original, borda de chocolate belga e chantilly fresco.",
          price: 29.0,
          imageUrl:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular"],
        },
      ],
    },
    {
      id: "rest-padaria-sao-bento",
      slug: "padaria-sao-bento",
      name: "Padaria & Café São Bento",
      segment: "Padaria Artesanal & Cafeteria",
      tagline: "Pães de fermentação natural saindo quentinhos a cada hora e cafés especiais",
      description:
        "Grãos 100% arábica torrados semanalmente, croissants folhados na manteiga francesa e brunch o dia todo.",
      logoUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
      coverUrl:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      primaryColor: "#059669",
      themeMode: "light",
      status: "trial",
      monthlyFee: 69.9,
      ownerName: "Helena Costa",
      ownerPhone: "5511977773333",
      ownerPin: "4321",
      allowOwnerEdit: true,
      address: "Praça São Bento, 85 - Centro",
      city: "Campinas - SP",
      openingHours: "Segunda a Sábado • 06h30 às 20h00",
      isOpenNow: true,
      wifiSsid: "CafeSaoBento",
      wifiPassword: "paonachapa",
      instagram: "@saobentopadaria",
      serviceFeeNotice: "Não cobramos taxa de serviço no balcão. Nas mesas, 10% opcional.",
      highlightBanner: "☕ Combo Manhã: Espresso Duplo + Pão na Chapa na Manteiga por R$ 18,90 até 11h!",
      createdAt: "2026-11-10T09:30:00.000Z",
      categories: [
        {
          id: "cat-sb-1",
          name: "Cafés Especiais",
          description: "Grãos selecionados do Sul de Minas",
          order: 1,
        },
        {
          id: "cat-sb-2",
          name: "Pães & Chapa",
          description: "Assados frescos com fermentação natural",
          order: 2,
        },
        {
          id: "cat-sb-3",
          name: "Doces & Confeitaria",
          description: "Para acompanhar seu café da tarde",
          order: 3,
        },
      ],
      items: [
        {
          id: "item-sb-1",
          categoryId: "cat-sb-1",
          name: "Cappuccino Italiano Cremoso",
          description:
            "Espresso duplo encorpado, leite vaporizado com microespuma sedosa e leve toque de cacau em pó.",
          price: 14.0,
          imageUrl:
            "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular"],
          variations: [
            { id: "var-sb-1p", label: "Pequeno (150ml)", price: 14.0 },
            { id: "var-sb-1g", label: "Grande (280ml)", price: 18.0 },
          ],
        },
        {
          id: "item-sb-2",
          categoryId: "cat-sb-2",
          name: "Croissant Folhado com Requeijão de Corte",
          description:
            "Croissant dourado com 27 camadas de massa folhada na manteiga, servido quentinho com requeijão cremoso.",
          price: 19.5,
          imageUrl:
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
          available: true,
          featured: true,
          badges: ["chef", "vegetarian"],
        },
        {
          id: "item-sb-3",
          categoryId: "cat-sb-2",
          name: "Toast de Abacate & Ovos Pochê",
          description:
            "Fatia generosa de pão sourdough tostado, pasta de abacate temperada com limão siciliano e dois ovos pochê.",
          price: 32.0,
          imageUrl:
            "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["new", "vegetarian"],
        },
        {
          id: "item-sb-4",
          categoryId: "cat-sb-3",
          name: "Bolo de Cenoura com Calda Quente de Chocolate",
          description:
            "Receita caseira fofinha servida com cobertura generosa de brigadeiro cremoso meio amargo.",
          price: 16.0,
          imageUrl:
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
          available: true,
          badges: ["popular"],
        },
      ],
    },
  ],
  nfcTags: [
    {
      code: "demo1",
      label: "Display Acrílico #01 (Mochila de Vendas)",
      targetSlug: "bella-napoli",
      scansCount: 42,
      lastUpdated: "2026-11-16T10:00:00.000Z",
    },
    {
      code: "demo2",
      label: "Cartão NFC Demonstração Comercial",
      targetSlug: "brasa-burger",
      scansCount: 19,
      lastUpdated: "2026-11-16T10:00:00.000Z",
    },
    {
      code: "mesa01",
      label: "Prisma Mesa 01 - Bella Napoli",
      targetSlug: "bella-napoli",
      scansCount: 128,
      lastUpdated: "2026-11-16T10:00:00.000Z",
    },
  ],
};

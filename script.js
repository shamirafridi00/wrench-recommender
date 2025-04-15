const { createApp } = Vue;

// Helper function (unchanged)
function getQuestionIndexById(questions, id) {
    return questions.findIndex(q => q.id === id);
}

// --- Scoring Configuration ---
const SCORE_WEIGHTS = {
    type: 3,        // Matching type is very important
    useCase: 2.5,   // Use case is important
    budget: 1,      // Budget match is less critical than type/use
    power: 1.5,     // Power type matters
    size: 1,        // Size preference
    skill: 0.5,     // Skill level is a minor factor
    keyword: 0.2    // Small bonus for keyword matches (if implemented later)
};
const POPULARITY_WEIGHT = 0.5; // How much popularity affects score (0-1)
const RECOMMENDATION_THRESHOLD = 5.0; // Minimum score to be considered a "Top Match"

createApp({
  data() {
    return {
      // Questions definition (unchanged)
      questions: [
         { id: 'type', text: 'What type of wrench do you need?', options: ['Adjustable wrench', 'Torque wrench', 'Impact wrench', 'Ratcheting wrench', 'Pipe wrench', 'Specialty wrench', 'Any'] },
         { id: 'useCase', text: 'What’s the main use case?', options: ['Automotive repair', 'Plumbing', 'Gunsmithing', 'Industrial projects', 'DIY home repairs', 'General-purpose', 'Any'] },
         { id: 'budget', text: 'What’s your budget?', options: ['$20-$50', '$50-$100', '$100-$200', '$200+', 'Any'] },
         { id: 'power', text: 'Manual or powered?', options: ['Manual', 'Air-powered', 'Battery-powered', 'Any'] },
         { id: 'size', text: 'Size/portability needs?', options: ['Compact/small tools', 'Standard size', 'Large/heavy-duty', 'Any'] },
         { id: 'skill', text: 'Your skill level?', options: ['Beginner', 'Intermediate', 'Expert/Professional', 'Any'] }
      ],
      // --- !! FULLY REVISED PRODUCT DATA !! ---
      products: [
        // --- Adjustable Wrenches ---
        {
          name: 'Crescent 10" Adjustable Wrench - AC210VS',
          description: 'Classic design known for durability and precise jaw movement.',
          type: 'Adjustable wrench', useCase: ['General-purpose', 'DIY home repairs', 'Automotive repair'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/51UTC-bHGVL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/3RNqXY0', price: '$17.97', popularity: 4.5, // High basic popularity
          brand: 'Crescent', keywords: ['alloy steel', 'chrome']
        },
        {
          name: 'WORKPRO 4-piece Adjustable Wrench Set (6", 8", 10", 12")',
          description: 'Great value set covering common sizes for home and workshop.',
          type: 'Adjustable wrench', useCase: ['General-purpose', 'DIY home repairs', 'Automotive repair'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
          imageUrl: 'https://m.media-amazon.com/images/I/710fbEkpBwL._AC_SX679_PIbundle-4,TopRight,0,0_SH20_.jpg', affiliateUrl: 'https://amzn.to/3ElRU1R', price: '$25.99', popularity: 4, // Good value set
          brand: 'WORKPRO', keywords: ['set', 'chrome-plated', 'heat treated']
        },
        {
          name: 'TEKTON 6 Inch Adjustable Wrench',
          description: 'Compact 6-inch size, ideal for tight spaces and smaller fasteners.',
          type: 'Adjustable wrench', useCase: ['General-purpose', 'DIY home repairs', 'Plumbing', 'Automotive repair', 'Electronics'], budget: '$20-$50', power: 'Manual', size: 'Compact/small tools', skill: ['Beginner', 'Intermediate'],
          imageUrl: 'https://m.media-amazon.com/images/I/611g-QxQWeL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4j974qk', price: '$28.00', popularity: 3, // Niche size, decent reviews
          brand: 'TEKTON', keywords: ['mini', 'compact', '1-1/2 inch jaw']
        },
        { // DURATECH 10" moved to Mini/Specialty Adjustable section as per paste.txt section 8
          name: 'DURATECH 10-Inch Adjustable Wrench (Wide Jaw)',
          description: 'Wide jaw opening, black oxide finish, marked scales. Good for plumbing.',
          type: 'Adjustable wrench', useCase: ['Plumbing', 'DIY home repairs', 'General-purpose'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
          imageUrl: 'https://m.media-amazon.com/images/I/71DY8bvq0OL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4j6ZzAa', price: '$19.99', popularity: 4.5, // Very popular based on buys
          brand: 'DURATECH', keywords: ['wide jaw', 'black oxide', 'plumbing', 'metric scale', 'sae scale']
        },
        {
          name: 'CRAFTSMAN 24” All Steel Adjustable Wrench',
          description: 'Heavy-duty 24-inch wrench for large fasteners and high torque.',
          type: 'Adjustable wrench', useCase: ['Industrial projects', 'Automotive repair', 'Plumbing'], budget: '$50-$100', power: 'Manual', size: 'Large/heavy-duty', skill: ['Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/41czPHEr0dL._AC_SX679_.jpg', affiliateUrl: 'https://amzn.to/4loQHYh', price: '$89.98', popularity: 4, // Amazon's Choice, many reviews
          brand: 'CRAFTSMAN', keywords: ['large', 'heavy-duty', 'steel']
        },
        // --- Torque Wrenches ---
        {
          name: 'TEKTON 1/2" Drive Micrometer Torque Wrench (10-150 ft.-lb.)',
          description: 'Highly popular, affordable, and reliable click-style torque wrench.',
          type: 'Torque wrench', useCase: ['Automotive repair', 'DIY home repairs', 'General-purpose'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
          imageUrl: 'https://m.media-amazon.com/images/I/61a33GwF3UL._AC_SX679_.jpg', affiliateUrl: 'https://amzn.to/44qCvYK', price: '$48.99', popularity: 5, // Amazon's Choice, huge reviews
          brand: 'TEKTON', keywords: ['click', 'micrometer', 'automotive']
        },
        {
          name: 'QUENCHING 1/2" Drive Split Beam Torque Wrench (40-250 ft.-lb.)',
          description: 'Split beam design with flex head, easier setting than micrometer style.',
          type: 'Torque wrench', useCase: ['Automotive repair', 'Industrial projects'], budget: '$100-$200', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/41LqaE6cMjL._AC_SL1000_.jpg', affiliateUrl: 'https://amzn.to/4lqfThf', price: '$134.99', popularity: 3.5, // Decent reviews, niche type
          brand: 'QUENCHING', keywords: ['split beam', 'flex head', 'heavy-duty']
        },
        {
          name: 'GEARWRENCH 1/2" Drive Electronic Torque Wrench (30-340 Nm)',
          description: 'Digital readout for high precision, target torque alerts. Pro choice.',
          type: 'Torque wrench', useCase: ['Automotive repair', 'Industrial projects', 'Gunsmithing'], budget: '$100-$200', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/51-kbJFuYOL._SL1500_.jpg', affiliateUrl: 'https://amzn.to/42dfmaW', price: '$138.83', popularity: 4.5, // Amazon's Choice, many reviews
          brand: 'GEARWRENCH', keywords: ['electronic', 'digital', 'Nm', 'ft-lb', 'precision']
        },
        {
          name: 'Precision Instruments 1/2" Drive Split Beam Torque Wrench w/ Flex Head',
          description: 'High-quality, accurate split beam wrench, favored by professionals.',
          type: 'Torque wrench', useCase: ['Automotive repair', 'Industrial projects'], budget: '$100-$200', power: 'Manual', size: 'Standard size', skill: ['Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/71gpsnQHtiL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4iiSdbz', price: '$188.75', popularity: 5, // Amazon's Choice, excellent reviews
          brand: 'Precision Instruments', keywords: ['split beam', 'flex head', 'professional', 'accurate']
        },
        {
          name: 'Wheeler Digital Firearms Accurizing Torque Wrench',
          description: 'Specialized digital torque wrench for precise gunsmithing tasks.',
          type: 'Specialty wrench', useCase: ['Gunsmithing'], budget: '$100-$200', power: 'Manual', size: 'Compact/small tools', skill: ['Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/71lkBMOnIOL._AC_SX679_PIbundle-12,TopRight,0,0_SH20_.jpg', affiliateUrl: 'https://amzn.to/3Y0dy2t', price: '$104.97', popularity: 4.5, // High reviews for niche
          brand: 'Wheeler', keywords: ['gunsmithing', 'digital', 'scope mounting', 'bits', 'firearms', 'FAT wrench'] // Also listed under Specialty
        },
        // --- Ratcheting Wrenches ---
        { // Note: paste.txt has mixed details. Using 15pc Serpentine set details.
          name: 'GEARWRENCH 15 Piece Ratcheting Serpentine Belt Tool Set',
          description: 'Specialized ratcheting tool set for accessing serpentine belts.',
          type: 'Ratcheting wrench', useCase: ['Automotive repair'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/71QTmctt0mL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4jpDSLy', price: '$40.95', popularity: 5, // Amazon's Choice, huge reviews
          brand: 'GEARWRENCH', keywords: ['serpentine belt', 'automotive', 'set', 'specialty tool']
        },
        { // Note: paste.txt shows SK, but image/link/details point to SK. Using SK details.
          name: 'SK Reversible Ratcheting Wrench Set, 12-Piece, Metric',
          description: 'Premium reversible ratcheting wrenches (8-19mm) with rack.',
          type: 'Ratcheting wrench', useCase: ['Automotive repair', 'Industrial projects', 'DIY home repairs'], budget: '$100-$200', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
          imageUrl: 'https://m.media-amazon.com/images/I/718ursgVK6L._AC_SX679_.jpg', affiliateUrl: 'https://amzn.to/4croQTa', price: '$129.99', popularity: 3.5, // Fewer reviews, premium brand
          brand: 'SK', keywords: ['reversible', 'set', 'metric', '72-tooth', 'rack organizer']
        },
        {
            name: 'HORUSDY 24-Piece Ratcheting Wrench Set (Metric & SAE)',
            description: 'Large, affordable set covering both Metric (8-19mm) & SAE (1/4"-7/8").',
            type: 'Ratcheting wrench', useCase: ['DIY home repairs', 'Automotive repair', 'General-purpose'], budget: '$50-$100', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/81VjcU0NMwL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4j5q2hz', price: '$79.99', popularity: 4, // Good reviews for budget set
            brand: 'HORUSDY', keywords: ['set', 'metric', 'sae', '72-tooth', 'organizer']
        },
        { // Note: paste.txt title: 24pc, details: 16pc Metric Reversible Set. Using 16pc details.
            name: 'Jaeger 16pc Metric Reversible Ratcheting Wrench Set',
            description: 'Reversible metric set (8-25mm) with lock-in rack, popular choice.',
            type: 'Ratcheting wrench', useCase: ['Automotive repair', 'Industrial projects', 'DIY home repairs'], budget: '$50-$100', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/81-shsVEa6L._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/43T0waS', price: '$93.97', popularity: 4.5, // Amazon's Choice
            brand: 'Jaeger', keywords: ['reversible', 'set', 'metric', 'rack case', 'speed wrench']
        },
        // --- Impact Wrenches ---
        { // Note: paste.txt title: 2235TiMAX, details: 231C. Using 231C details.
            name: 'Ingersoll Rand 231C 1/2" Drive Air Impact Wrench',
            description: 'A classic, reliable, and powerful pneumatic impact wrench.',
            type: 'Impact wrench', useCase: ['Automotive repair', 'Industrial projects'], budget: '$100-$200', power: 'Air-powered', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/51kVVWnNLxL._AC_SL1000_.jpg', affiliateUrl: 'https://amzn.to/3EtsfnV', price: '$133.40', popularity: 5, // Amazon's Choice, many reviews
            brand: 'Ingersoll Rand', keywords: ['air', 'pneumatic', 'automotive']
        },
        {
            name: 'DEWALT 20V MAX XR Cordless Impact Wrench 1/2" (Bare Tool)',
            description: 'Powerful cordless impact (600 ft-lbs fastening) with 4 modes (tool only).',
            type: 'Impact wrench', useCase: ['Automotive repair', 'DIY home repairs', 'Industrial projects'], budget: '$200+', // Price is borderline $199.74, adjusted category
            power: 'Battery-powered', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/51DaRHFaRTL._AC_SL1000_.jpg', affiliateUrl: 'https://amzn.to/3RdQ5qL', price: '$199.74', popularity: 4.5, // Good reviews
            brand: 'DEWALT', keywords: ['cordless', 'battery', 'XR', 'variable speed', 'LED light', 'bare tool']
        },
         {
            name: 'AIRCAT 1150 “Killer Torque” 1/2" Impact Wrench',
            description: 'High torque (1295 ft-lbs breakaway) with quieter operation.',
            type: 'Impact wrench', useCase: ['Automotive repair', 'Industrial projects'], budget: '$100-$200', // Price is $199.00
            power: 'Air-powered', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/71sIK6QtwaL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4j8TWSn', price: '$199.00', popularity: 4, // Amazon's Choice, good reviews
            brand: 'AIRCAT', keywords: ['air', 'pneumatic', 'high torque', 'quiet', 'composite']
        },
        {
            name: 'Milwaukee M18 FUEL 1/2" High Torque Impact Wrench (Tool Only)',
            description: '#1 Best Seller. Extremely powerful cordless impact wrench (tool only).',
            type: 'Impact wrench', useCase: ['Automotive repair', 'Industrial projects'], budget: '$100-$200', // Price $193.99
            power: 'Battery-powered', size: 'Standard size', skill: ['Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/511C5yksEmL._AC_SX679_.jpg', affiliateUrl: 'https://amzn.to/3G91HsQ', price: '$193.99', popularity: 5, // #1 Best Seller, huge reviews
            brand: 'Milwaukee', keywords: ['cordless', 'battery', 'M18 Fuel', 'high torque', 'friction ring', 'bare tool']
        },
        // --- Pipe Wrenches ---
        {
            name: 'RIDGID 14" Aluminum Straight Pipe Wrench (Model 814)',
            description: 'Lightweight aluminum version of the industry standard pipe wrench.',
            type: 'Pipe wrench', useCase: ['Plumbing', 'Industrial projects', 'DIY home repairs'], budget: '$50-$100', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/512uEoH3BmL._AC_SL1000_.jpg', affiliateUrl: 'https://amzn.to/3G9tt8q', price: '$59.99', popularity: 4.5, // High reviews
            brand: 'RIDGID', keywords: ['plumbing', 'aluminum', 'straight', 'I-beam handle']
        },
        { // Note: paste.txt title: 10" Alum Pipe, details: 12" Adj Wrench. Using 12" Adj details & re-categorizing.
            name: 'Crescent 12" Adjustable Wrench - AC212VS',
            description: 'Standard 12-inch adjustable wrench, chrome finish.',
            type: 'Adjustable wrench', useCase: ['General-purpose', 'DIY home repairs'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/51x1jAG87sS._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4lyVNS4', price: '$21.64', popularity: 4.5, // Amazon's Choice, high buys
            brand: 'Crescent', keywords: ['chrome', 'alloy steel'] // Moved from Pipe Wrenches
        },
        { // Note: paste.txt title: WORKPRO 3-Piece, details: DURATECH 3-Piece (10,14,18). Using Duratech details.
            name: 'DURATECH 3-Piece Aluminum Straight Pipe Wrench Set (10", 14", 18")',
            description: 'Highly popular, affordable set of aluminum pipe wrenches.',
            type: 'Pipe wrench', useCase: ['Plumbing', 'DIY home repairs', 'Industrial projects'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/715TXCZETvL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/3G9AMgv', price: '$42.49', popularity: 5, // Amazon's Choice, Overall Pick, huge buys
            brand: 'DURATECH', keywords: ['set', 'plumbing', 'aluminum', 'heavy duty', 'adjustable']
        },
        {
            name: 'Irwin Vise-Grip 11" Aluminum Quick Adjust Pipe Wrench',
            description: 'Unique quick-adjusting jaw mechanism for faster use.',
            type: 'Pipe wrench', useCase: ['Plumbing', 'DIY home repairs', 'General-purpose'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/61alpgMZv2S._AC_SL1200_.jpg', affiliateUrl: 'https://amzn.to/4lz9aBG', price: '$38.99', popularity: 3, // Lower review score
            brand: 'IRWIN', keywords: ['quick adjust', 'plumbing', 'aluminum', 'self-adjusting']
        },
        // --- Specialty Wrenches ---
        // Wheeler Digital Firearms listed under Torque Wrenches
        {
            name: 'Tooluxe Dual Drive Beam Style Torque Wrench (0-150 Ft-Lbs)',
            description: 'Simple, classic beam-style torque wrench with 3/8" & 1/2" drives.',
            type: 'Specialty wrench', // Technically a Torque Wrench
             useCase: ['Automotive repair', 'DIY home repairs', 'General-purpose'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/61L3pNFjh2L._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/3RC1hhb', price: '$21.97', popularity: 4, // Good reviews for type
            brand: 'Tooluxe', keywords: ['beam torque', 'dual drive', 'SAE']
        },
        {
            name: 'ValueMax 2-piece Strap Wrench Set (4" & 6")',
            description: 'Very popular non-marring strap wrench set for various uses.',
            type: 'Specialty wrench', // Strap Wrench
             useCase: ['Plumbing', 'DIY home repairs', 'Automotive repair', 'General-purpose'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/716n2WCdYxL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/42SetUn', price: '$19.99', popularity: 5, // Huge buys
            brand: 'ValueMax', keywords: ['strap wrench', 'set', 'oil filter', 'jar opener', 'plumbing', 'adjustable'] // Also under Strap Wrenches
        },
        { // Note: paste.txt title: ARES O2, details: DURATECH 5pcs. Using Duratech details.
            name: 'DURATECH 5PCS O2 Oxygen Sensor Socket & Thread Chaser Set',
            description: 'Essential kit for removing/installing O2 sensors and cleaning threads.',
            type: 'Specialty wrench', // Automotive Specialty
             useCase: ['Automotive repair'], budget: '$20-$50', power: 'Manual', size: 'Compact/small tools', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/71UrmBitHEL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/3YvUitL', price: '$18.99', popularity: 5, // Amazon's Choice, Overall Pick, huge buys
            brand: 'DURATECH', keywords: ['oxygen sensor', 'O2 sensor', 'socket set', 'automotive', 'thread chaser']
        },
        // --- Strap Wrenches (Subset of Specialty) ---
        {
            name: 'RIDGID Model 5 Strap Wrench (5-inch Capacity)',
            description: 'Heavy-duty polyurethane-coated strap wrench for large pipes.',
            type: 'Specialty wrench', // Strap Wrench
             useCase: ['Plumbing', 'Industrial projects'], budget: '$50-$100', power: 'Manual', size: 'Large/heavy-duty', skill: ['Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/71VtI4+mKOL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4jbZ5Jl', price: '$80.99', popularity: 4.5, // Amazon's Choice, good reviews
            brand: 'RIDGID', keywords: ['strap wrench', 'heavy-duty', 'plumbing', 'non-marring']
        },
        // ValueMax 2-Piece already listed under Specialty
        {
            name: 'GEARWRENCH Heavy-Duty Oil Filter Strap Wrench',
            description: 'Strong strap wrench specifically designed for oil filters (3/8" & 1/2" drive).',
            type: 'Specialty wrench', // Strap Wrench
             useCase: ['Automotive repair', 'DIY home repairs'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate', 'Expert/Professional'],
            imageUrl: 'https://m.media-amazon.com/images/I/81OPNCa8zsL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4cPqzSN', price: '$34.30', popularity: 4, // Amazon's Choice, good reviews
            brand: 'GEARWRENCH', keywords: ['strap wrench', 'oil filter', 'automotive', 'nylon strap']
        },
        {
            name: 'Boa Constrictor Aluminum Strap Wrench',
            description: 'Lightweight aluminum body strap wrench with long strap (39").',
            type: 'Specialty wrench', // Strap Wrench
             useCase: ['Plumbing', 'DIY home repairs', 'General-purpose', 'Automotive repair'], budget: '$20-$50', power: 'Manual', size: 'Standard size', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/51+LqYdydCL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/43MfcZc', price: '$22.40', popularity: 4.5, // Amazon's Choice, good reviews
            brand: 'BOA', keywords: ['strap wrench', 'aluminum', 'lightweight']
        },
        // --- Mini and Specialty Adjustable Wrenches ---
        {
            name: 'TEKTON 4 Inch Mini Adjustable Wrench',
            description: 'Very small (4") adjustable wrench for precision work in tight spaces.',
            type: 'Adjustable wrench', useCase: ['DIY home repairs', 'General-purpose', 'Gunsmithing', 'Electronics'], budget: '$20-$50', power: 'Manual', size: 'Compact/small tools', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/61phxEMGoqL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/3E5H3cw', price: '$9.79', popularity: 4.5, // Amazon's Choice, good reviews
            brand: 'TEKTON', keywords: ['mini', 'compact', '4 inch']
        },
        // DURATECH 10-Inch already listed under Adjustable
        {
            name: 'WORKPRO 6-Inch Adjustable Wrench',
            description: 'Compact 6-inch adjustable wrench, wide jaw, metric/SAE scales.',
            type: 'Adjustable wrench', useCase: ['DIY home repairs', 'General-purpose', 'Plumbing', 'Automotive repair', 'Electronics'], budget: '$20-$50', power: 'Manual', size: 'Compact/small tools', skill: ['Beginner', 'Intermediate'],
            imageUrl: 'https://m.media-amazon.com/images/I/61Oo2-0IhGL._AC_SL1500_.jpg', affiliateUrl: 'https://amzn.to/4llwFOm', price: '$9.99', popularity: 5, // Amazon's Choice, huge buys
            brand: 'WORKPRO', keywords: ['compact', '6 inch', 'wide jaw', 'metric scale', 'sae scale']
        },
        // Craftsman 6-Inch Adjustable Wrench - Missing data in paste.txt, cannot add accurately.
      ],
      answers: {},
      currentQuestionIndex: 0,
      questionHistory: [], // Stores indices of visited questions
      showResults: false,
      recommendedWrenches: [], // Will store { product, matchScore }
      generalFallbackWrenches: [], // For when no scored matches are found
      transitionName: 'slide-next',
      skippedQuestions: {},
      bestScore: 0, // Track the highest score achieved
      scoreThreshold: RECOMMENDATION_THRESHOLD // Store threshold in data
    };
  },
  computed: {
    // Get the current question object
    currentQuestion() {
      return this.questions[this.currentQuestionIndex] ?? null;
    },
    // Calculate total *active* questions for progress
     totalActiveQuestions() {
         // Simple count for now, could be dynamic if skipping rules were complex
         return this.questions.length;
     },
     // Display index adjusted for 1-based counting
     currentQuestionDisplayIndex() {
         return this.currentQuestionIndex + 1;
     },
     // Calculate progress percentage
     progressPercentage() {
         if (this.showResults) return 100;
         const totalSteps = this.totalActiveQuestions;
         // Progress based on *starting* the current step
         return totalSteps > 0 ? ((this.currentQuestionIndex) / totalSteps) * 100 : 0;
     },
    // Can we go back?
    canGoBack() {
      return this.questionHistory.length > 0;
    }
  },
  methods: {
    // Called when a radio button is selected
    selectOption(questionId, option) {
      this.answers = { ...this.answers, [questionId]: option };
      setTimeout(() => this.nextStep(), 150); // Tiny delay for feedback
    },

    // Logic to determine and move to the next question or results
    nextStep() {
        this.transitionName = 'slide-next';
        this.skippedQuestions = {};

        // Store current index in history before moving
        if (!this.questionHistory.includes(this.currentQuestionIndex)) {
             this.questionHistory.push(this.currentQuestionIndex);
        }

        const currentId = this.currentQuestion.id;
        let nextIndex = this.currentQuestionIndex + 1;

        // --- Conditional Logic Example ---
        const powerQuestionIndex = getQuestionIndexById(this.questions, 'power');
        const isPowerNext = (this.currentQuestionIndex + 1) === powerQuestionIndex;

        // Skip power question if a manual-only type is selected
        if (currentId === 'type' && isPowerNext &&
            ['Adjustable wrench', 'Torque wrench', 'Ratcheting wrench', 'Pipe wrench', 'Specialty wrench'].includes(this.answers.type) && this.answers.type !== 'Any')
        {
               console.log("Skipping Power Question for manual type:", this.answers.type);
               this.answers = { ...this.answers, power: 'Manual' }; // Assume manual
               this.skippedQuestions['power'] = true; // Mark as skipped
               nextIndex = powerQuestionIndex + 1; // Jump past power question
        }
        // --- End Conditional Logic ---

        // Check if we've reached the end
        if (nextIndex >= this.questions.length) {
            this.calculateRecommendations(); // Use the new scoring method
        } else {
            this.currentQuestionIndex = nextIndex;
        }
         this.scrollToTop();
    },

    // Go back to the previous question
    goBack() {
        if (!this.canGoBack) return;
        this.transitionName = 'slide-prev';
        const previousIndex = this.questionHistory.pop();

        const goingToQuestionId = this.questions[previousIndex].id;
        // Clear answer for the question we are going TO, and any implicitly set answers after it
        const tempAnswers = { ...this.answers };
        delete tempAnswers[goingToQuestionId];

        // If going back before power question, clear implicitly set 'power' answer
        const powerQuestionIndex = getQuestionIndexById(this.questions, 'power');
        if (previousIndex < powerQuestionIndex && tempAnswers['power'] === 'Manual' && this.skippedQuestions['power']) { // Check if it was implicitly set
            delete tempAnswers['power'];
        }
        this.answers = tempAnswers;

        this.currentQuestionIndex = previousIndex;
        this.showResults = false;
        this.skippedQuestions = {};
        this.scrollToTop();
    },

    // --- NEW SCORING & RECOMMENDATION LOGIC ---
    calculateRecommendations() {
        let scoredProducts = this.products.map(product => {
            let score = 0;

            // Score based on matching criteria
            for (const questionId in this.answers) {
                const answer = this.answers[questionId];
                if (answer && answer !== 'Any') { // Only score answered, non-'Any' criteria
                    const weight = SCORE_WEIGHTS[questionId] || 0;
                    let match = false;

                    switch (questionId) {
                        case 'type':
                            // Broader match for 'Specialty wrench' answer
                            if (answer === 'Specialty wrench') {
                                if (['Specialty wrench', 'Torque wrench'].includes(product.type) || product.keywords?.includes('strap wrench') || product.keywords?.includes('oxygen sensor')) {
                                    match = true;
                                }
                            } else if (product.type === answer) {
                                match = true;
                            }
                            break;
                        case 'useCase':
                            if (product.useCase?.includes(answer)) match = true;
                            break;
                        case 'budget':
                            if (product.budget === answer) match = true;
                            break;
                        case 'power':
                            if (product.power === answer) match = true;
                            break;
                        case 'size':
                            if (product.size === answer) match = true;
                            break;
                        case 'skill':
                             if (product.skill?.includes(answer)) match = true;
                             break;
                        // Add keyword scoring later if needed
                    }
                    if (match) {
                        score += weight;
                    }
                }
            }

            // Add popularity bonus (scaled)
            score += (product.popularity || 0) * POPULARITY_WEIGHT;

            return { ...product, matchScore: score };
        });

        // Sort by score (descending), then maybe by popularity as tie-breaker
        scoredProducts.sort((a, b) => {
             if (b.matchScore !== a.matchScore) {
                 return b.matchScore - a.matchScore;
             }
             return (b.popularity || 0) - (a.popularity || 0); // Tie-breaker
        });

        console.log("Scored Products:", scoredProducts.map(p => ({ name: p.name, score: p.matchScore }))); // Debugging

        // Filter results - show top N or those above threshold
        const topResults = scoredProducts.slice(0, 6); // Show max top 6 results

        this.recommendedWrenches = topResults.filter(p => p.matchScore > 0); // Only show items with *some* positive score
        this.bestScore = this.recommendedWrenches[0]?.matchScore || 0; // Get the score of the top item

        // Prepare general fallbacks ONLY if no scored recommendations found
        if (this.recommendedWrenches.length === 0) {
          this.generalFallbackWrenches = this.products
              .filter(p => ['Adjustable wrench', 'Ratcheting wrench'].includes(p.type) && p.popularity >= 4.5) // Very popular common types
              .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
              .slice(0, 3); // Show top 3
        } else {
             this.generalFallbackWrenches = []; // Clear general fallbacks if we have scored results
        }

        this.showResults = true;
        this.scrollToTop();
    },
    // --- END NEW LOGIC ---

    // Reset the entire form
    resetForm() {
      this.answers = {};
      this.currentQuestionIndex = 0;
      this.questionHistory = [];
      this.recommendedWrenches = [];
      this.generalFallbackWrenches = [];
      this.showResults = false;
      this.transitionName = 'slide-next';
      this.skippedQuestions = {};
      this.bestScore = 0;
      this.scrollToTop();
    },

    // Helper to scroll to top smoothly
    scrollToTop() {
        this.$nextTick(() => {
           const appElement = document.getElementById('app');
           if (appElement) {
                appElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
           }
       });
    }
  },
   mounted() {
       // Initial setup if needed
       this.scrollToTop();
   }
}).mount('#app');

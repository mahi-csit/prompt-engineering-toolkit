"""
Mock LLM provider for demonstration and testing.
Provides realistic, relevant demo responses without requiring API keys.
"""
from typing import Optional
from .base import BaseLLMProvider


class MockProvider(BaseLLMProvider):
    """Mock provider that returns realistic, relevant demo responses."""

    provider_name = "mock"

    def __init__(self):
        """Initialize the mock provider (no API key needed)."""
        pass

    async def complete(
        self,
        prompt: str,
        model: str = "demo-fast",
        temperature: float = 0.7,
        max_tokens: int = 1024,
        system: Optional[str] = None,
    ) -> str:
        """Return a relevant demo response based on the selected model."""
        if model == "demo-fast":
            return self._demo_fast_response(prompt)
        elif model == "demo-creative":
            return self._demo_creative_response(prompt)
        elif model == "demo-detailed":
            return self._demo_detailed_response(prompt)
        else:
            return await self.complete_simulated(prompt, model, self.provider_name, temperature, max_tokens)

    async def complete_simulated(
        self,
        prompt: str,
        model: str,
        provider_name: str = "mock",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """Generate realistic model-specific responses when API keys are not configured or calls fail."""
        topic = self._extract_topic(prompt)
        
        if model in ["demo-fast", "demo-creative", "demo-detailed"]:
            return await self.complete(prompt, model, temperature, max_tokens)

        if provider_name == "openai" or "gpt" in model.lower():
            return (
                f"### OpenAI {model} Analysis\n\n"
                f"**Prompt Topic**: {topic.capitalize()}\n\n"
                f"1. **Core Concept**: Addressing *\"{prompt.strip()[:70]}...\"*, this query requires structured reasoning and practical insights.\n\n"
                f"2. **Structured Breakdown**:\n"
                f"   - **Clarity**: Ensure clear objectives and context.\n"
                f"   - **Methodology**: Apply systematic problem solving.\n"
                f"   - **Execution**: Measure results against predefined quality metrics.\n\n"
                f"3. **Recommendation**: Define explicit variables (e.g., `{{variable_name}}`) to make this prompt reusable across different scenarios."
            )
        elif provider_name == "anthropic" or "claude" in model.lower():
            return (
                f"### Anthropic {model} Response\n\n"
                f"I'd be glad to help analyze your prompt regarding **{topic.capitalize()}**.\n\n"
                f"**Detailed Breakdown**:\n"
                f"When evaluating *\"{prompt.strip()[:70]}...\"*, we can consider three key angles:\n\n"
                f"• **Contextual Nuance**: Anthropic Claude excels at thorough, well-reasoned explanations with high safety and alignment.\n"
                f"• **Analytical Depth**: Break complex ideas into step-by-step logic.\n"
                f"• **Practical Guidance**: Add explicit role-playing instructions to guide tone and format.\n\n"
                f"Let me know if you would like to explore further!"
            )
        elif provider_name == "gemini" or "gemini" in model.lower():
            return (
                f"### Google Gemini {model} Output\n\n"
                f"**Topic Insight ({topic.capitalize()})**:\n"
                f"{self._demo_fast_response(prompt)}\n\n"
                f"⚡ **Key Takeaways**:\n"
                f"- High efficiency and multimodal reasoning capability.\n"
                f"- Optimized for speed, factual accuracy, and rapid task completion.\n\n"
                f"*Tip: Use Gemini with concise system prompts for maximum output quality.*"
            )
        else:
            return self._demo_detailed_response(prompt)

    def _demo_fast_response(self, prompt: str) -> str:
        """Generate a short, concise response (2-3 sentences) relevant to the topic."""
        prompt_lower = prompt.lower()
        
        # Topic-specific short responses
        responses = {
            "avengers": "Avengers is a superhero team from Marvel Comics known for their diverse powers and teamwork. The franchise includes blockbuster movies and comics that have shaped modern pop culture. They work together to save the world from threats no single hero can handle.",
            
            "python": "Python is a high-level, interpreted programming language known for its simplicity and readability. It's widely used in web development, data science, machine learning, and automation. Python's extensive libraries and active community make it ideal for both beginners and experts.",
            
            "machine learning": "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without explicit programming. It powers recommendations, image recognition, natural language processing, and countless modern applications. The key is having quality data and the right algorithms for your problem.",
            
            "climate change": "Climate change refers to long-term shifts in global temperatures and weather patterns, primarily driven by human activities like fossil fuel burning. It impacts ecosystems, agriculture, economies, and human societies worldwide. Addressing it requires international cooperation, renewable energy adoption, and policy changes.",
            
            "cryptocurrency": "Cryptocurrency is a digital currency secured by cryptography that operates on decentralized networks like blockchain. Bitcoin and Ethereum are the most well-known examples. They offer new possibilities for financial transactions but also come with volatility and regulatory challenges.",
            
            "artificial intelligence": "Artificial intelligence refers to computer systems designed to perform tasks that typically require human intelligence. AI powers chatbots, recommendation systems, autonomous vehicles, and medical diagnostics. Its development raises important questions about ethics, employment, and societal impact.",
        }
        
        # Check for keywords in prompt
        for keyword, response in responses.items():
            if keyword in prompt_lower:
                return response
        
        # Default response for unknown topics
        return "That's an interesting topic. It has real-world applications and opens up many possibilities for exploration. Understanding the fundamentals will help you apply these concepts effectively."

    def _demo_creative_response(self, prompt: str) -> str:
        """Generate a creative, fun response with emojis about the actual topic."""
        prompt_lower = prompt.lower()
        
        # Topic-specific creative responses
        responses = {
            "avengers": "✨ The Avengers are absolutely incredible! 🦸 A team of superheroes with incredible powers, each bringing unique abilities. From Iron Man's tech genius 🤖 to Thor's godly powers ⚡, Captain America's leadership 🛡️ to Black Widow's skills 🥷, they come together as the ultimate team! 🚀 Together they're unstoppable!",
            
            "python": "🐍 Python is absolutely amazing! 💪 It's like the Swiss Army knife of programming languages. You can use it for anything - web apps 🌐, data science 📊, AI 🧠, automation 🤖, you name it! 🎯 The syntax is clean and readable, making coding feel like writing poetry 📝. No wonder so many developers love it! ❤️",
            
            "machine learning": "🤖 Machine Learning is mind-blowing! 🧠 Imagine creating systems that learn and improve on their own - that's the magic! ✨ From predicting the future 🔮 to understanding language 💬, recognizing faces 👤 to recommending movies 🎬, ML is everywhere! 🌟 It's like giving computers the ability to think! 💡",
            
            "climate change": "🌍 Our planet needs us! 💚 Climate change is real and urgent, but we have the power to make a difference! 🌱 Every action counts - from renewable energy ☀️ to reducing waste ♻️. Together we can create a sustainable future 🌿 for our children and nature 🦁🐝🌳. Let's take action! 💪✨",
            
            "cryptocurrency": "💰 Cryptocurrency is revolutionary! 🚀 Imagine money that's digital, secure, and decentralized - welcome to blockchain! ⛓️ Bitcoin, Ethereum, and thousands of others are reshaping finance! 📈💎 It's like the internet but for money! 🌐💵 The future is decentralized! ✨",
            
            "artificial intelligence": "🧠 AI is transforming everything! 🚀 From ChatGPT to self-driving cars 🚗, from medical diagnosis 🏥 to creative art 🎨, AI is everywhere! ✨ We're living in an incredible time where machines can understand, learn, and create! 🤖💡 The possibilities are endless! 🌟",
        }
        
        # Check for keywords in prompt
        for keyword, response in responses.items():
            if keyword in prompt_lower:
                return response
        
        # Default creative response
        return "🌟 That's a fantastic topic! 💡 It's absolutely fascinating and has so many exciting possibilities! 🚀 The more you explore it, the more you discover! ✨ Keep asking great questions and pushing boundaries! 🎯💪"

    def _demo_detailed_response(self, prompt: str) -> str:
        """Generate a detailed, multi-paragraph response about the actual topic."""
        prompt_lower = prompt.lower()
        
        # Topic-specific detailed responses
        if "avengers" in prompt_lower:
            return """## The Avengers: Earth's Mightiest Heroes

**Overview**
The Avengers are a superhero team from Marvel Comics that was first formed in 1963. The team brings together the world's most powerful heroes to face threats that no single hero can handle alone. The comic book franchise has expanded into a cinematic universe that has become a cultural phenomenon.

**The Team**
The core Avengers include Iron Man (Tony Stark), a genius billionaire with advanced technology; Thor, the God of Thunder from Asgard; Captain America (Steve Rogers), a super-soldier with enhanced abilities; Hulk (Bruce Banner), a scientist with incredible strength; Black Widow (Natasha Romanoff), a master spy and martial artist; and Hawkeye (Clint Barton), an expert archer and strategist. Over the years, many other heroes have joined including Spider-Man, Black Panther, Doctor Strange, and many more.

**Impact and Legacy**
The Avengers films have grossed billions at the box office and shaped popular culture significantly. The MCU's interconnected storytelling approach revolutionized how superhero movies are made. The franchise explores themes of teamwork, sacrifice, responsibility, and hope. Characters face personal struggles while working together for the greater good.

**Why They Matter**
The Avengers demonstrate the power of diversity and unity. Each hero brings unique strengths, and their collaboration creates something greater than the sum of its parts. They inspire audiences to value teamwork, courage, and standing up for what's right."""
        
        elif "python" in prompt_lower:
            return """## Python: The Versatile Programming Language

**What is Python?**
Python is a high-level, interpreted programming language created in 1989 by Guido van Rossum. It emphasizes code readability and simplicity, using English-like syntax that makes it accessible to beginners while remaining powerful enough for experts. Python runs on multiple platforms including Windows, macOS, and Linux.

**Key Characteristics**
Python's design philosophy prioritizes clarity and simplicity. It uses indentation instead of brackets to define code blocks, making code visually clean and readable. Python is dynamically typed, meaning you don't need to declare variable types explicitly. It supports multiple programming paradigms including procedural, object-oriented, and functional programming.

**Use Cases**
Python is remarkably versatile. In web development, frameworks like Django and Flask power millions of websites. Data scientists use pandas, NumPy, and scikit-learn for analysis and machine learning. AI and deep learning rely heavily on TensorFlow and PyTorch. Automation engineers write scripts for DevOps and system administration. Educators use Python to teach programming fundamentals.

**Why Python is Popular**
The combination of simplicity and power makes Python attractive to both beginners and experienced developers. The extensive standard library and third-party packages (via pip) mean solutions exist for virtually any problem. The active community provides tremendous support, documentation, and resources. Major companies like Google, Netflix, Dropbox, and Instagram use Python extensively."""
        
        elif "machine learning" in prompt_lower:
            return """## Machine Learning: Teaching Computers to Learn

**Fundamentals**
Machine learning is a subset of artificial intelligence that enables computer systems to learn and improve from experience without being explicitly programmed for every scenario. Rather than following pre-written rules, ML algorithms identify patterns in data and make decisions based on those patterns. This capability has revolutionized countless industries.

**Core Types**
Supervised learning uses labeled data to train models to predict outputs for new inputs - think email spam detection. Unsupervised learning discovers hidden patterns in unlabeled data, like customer segmentation. Reinforcement learning teaches systems to make sequences of decisions by rewarding correct actions - used in game AI and robotics. Semi-supervised learning combines small amounts of labeled data with large amounts of unlabeled data.

**Real-World Applications**
ML powers recommendation engines that suggest products and content. Computer vision systems recognize faces, detect objects, and enable autonomous vehicles. Natural language processing enables chatbots, translation, and sentiment analysis. In healthcare, ML helps diagnose diseases early. Financial institutions use ML for fraud detection and trading. Manufacturing uses ML for quality control and predictive maintenance.

**The Machine Learning Pipeline**
Success requires multiple steps: gathering quality data, cleaning and preprocessing it, selecting appropriate features, choosing the right algorithm, training the model, evaluating its performance, and deploying it at scale. Model performance depends on data quality, feature engineering, algorithm selection, and hyperparameter tuning. Continuous monitoring and retraining keep models accurate as data changes."""
        
        elif "climate change" in prompt_lower:
            return """## Climate Change: A Global Challenge

**What is Happening**
Climate change refers to long-term shifts in global temperatures and weather patterns, with primary drivers being human activities. Since industrialization, burning fossil fuels (coal, oil, natural gas) has increased atmospheric CO2 levels by 50%. This enhanced greenhouse effect traps more heat, raising global average temperatures. Methane from agriculture and deforestation accelerates warming. These changes are measurable and well-documented by scientific consensus.

**Observable Impacts**
Rising temperatures cause glaciers and polar ice to melt, raising sea levels and threatening coastal communities. Weather patterns shift, intensifying hurricanes, droughts, floods, and wildfires. Ecosystems face stress as habitats change faster than species can adapt. Agriculture becomes less predictable. Ocean acidification threatens marine life. Heat waves cause health emergencies in vulnerable populations.

**Systemic Effects**
Climate change has cascading effects across human systems. Agricultural productivity decreases, threatening food security. Water scarcity worsens. Mass migration increases from affected regions. Economic losses mount through infrastructure damage and reduced productivity. Climate change disproportionately affects lower-income countries despite them contributing least to emissions.

**Solutions and Pathways**
Transitioning to renewable energy (solar, wind, geothermal) is essential. Improving energy efficiency reduces consumption. Protecting and restoring forests removes CO2. Electrifying transportation eliminates emissions. Circular economy practices reduce waste. Policy changes, carbon pricing, and international cooperation are necessary. Individual actions combined with systemic change create meaningful impact."""
        
        elif "cryptocurrency" in prompt_lower:
            return """## Cryptocurrency: Digital Currency Revolution

**Blockchain Technology**
Cryptocurrency operates on blockchain technology - a distributed ledger that records transactions across many computers. Each block contains multiple transactions linked cryptographically to the previous block, creating an immutable chain. No single authority controls the blockchain; instead, network participants (nodes) maintain consensus through complex algorithms. This decentralization ensures security and transparency.

**Bitcoin and Beyond**
Bitcoin, launched in 2009, was the first cryptocurrency, created by the pseudonymous Satoshi Nakamoto. It uses proof-of-work consensus where miners solve computational puzzles to validate transactions and earn rewards. Ethereum, launched in 2015, introduced smart contracts - programs that execute automatically when conditions are met. Thousands of cryptocurrencies now exist, each with different purposes and mechanisms.

**Use Cases and Benefits**
Cryptocurrency enables fast, low-cost international transfers without intermediaries. It provides financial services to unbanked populations. Smart contracts automate complex agreements. NFTs enable digital ownership verification. Cryptocurrencies offer censorship resistance and privacy possibilities. Some view them as hedges against inflation or currency devaluation.

**Challenges and Controversies**
Cryptocurrencies remain highly volatile - value can swing dramatically. Regulatory uncertainty creates risks for investors and businesses. Energy consumption, especially proof-of-work systems, raises environmental concerns. Security risks include exchange hacks and user error. Criminal use for money laundering and ransomware persists. Technical complexity creates barriers to adoption. The speculative bubble mentality has led to significant losses for retail investors."""
        
        elif "artificial intelligence" in prompt_lower:
            return """## Artificial Intelligence: The Future is Here

**Defining AI**
Artificial intelligence refers to computer systems designed to perform tasks that typically require human intelligence. This includes learning from experience, recognizing patterns, understanding language, making decisions, and solving problems. AI has evolved from simple rule-based systems to sophisticated deep learning models that can perform remarkably human-like tasks.

**Current Capabilities**
Modern AI powers virtual assistants like Siri and Alexa that understand natural language. Computer vision systems recognize faces, read text, and identify objects with accuracy exceeding human performance. Recommendation algorithms suggest content and products with surprising accuracy. Large language models like GPT generate human-like text. AI defeats world champions in complex games like chess and Go. Medical AI systems diagnose diseases from imaging data.

**Applications Across Industries**
Healthcare uses AI for diagnosis, drug discovery, and treatment planning. Finance employs AI for trading, fraud detection, and credit assessment. Autonomous vehicles combine computer vision and decision-making AI. Manufacturing uses AI for quality control and predictive maintenance. Retail uses AI for personalization and inventory management. Entertainment uses AI for content creation and recommendation.

**Important Considerations**
AI brings tremendous benefits but also raises critical questions. Bias in training data can perpetuate discrimination. Job displacement affects workers in certain fields. Privacy concerns arise from data collection and analysis. Autonomous weapons raise ethical alarms. AI systems can make mistakes with serious consequences. Explainability remains challenging for complex models. Society must thoughtfully develop ethical frameworks and governance structures for AI advancement."""
        
        else:
            # Default detailed response
            return f"""## Exploring Your Topic

**Introduction**
You've asked about an interesting and multifaceted subject. Understanding this topic requires examining multiple dimensions and considering various perspectives and applications.

**Core Concepts**
The fundamental principles of this topic form the foundation for deeper understanding. These concepts have evolved over time as knowledge and technology have advanced. Learning these basics provides a framework for more sophisticated analysis.

**Applications and Impact**
This topic has real-world applications that affect individuals, organizations, and society. Different domains may apply the concepts differently based on their specific needs and constraints. Understanding these applications helps you see the practical value of the topic.

**Challenges and Future Directions**
Like any significant topic, this one faces ongoing challenges and evolving developments. Researchers and practitioners continue to advance the field. New technologies and methodologies create fresh opportunities and questions. The future will likely bring important innovations and refined understanding.

**Conclusion**
This topic represents an important area of study and application. Success comes from combining knowledge with practical experience and staying curious about how it develops. Keep asking questions, exploring different perspectives, and engaging with the community."""
        
        return "That's an interesting topic worth exploring in depth."

    def _extract_topic(self, prompt: str) -> str:
        """Extract a simple topic from the prompt (meaningful words, not question words)."""
        # Filter out common question words and small words
        stop_words = {
            "what", "how", "why", "when", "where", "who", "can", "could",
            "would", "should", "is", "are", "do", "does", "the", "a", "an",
            "write", "tell", "explain", "describe", "this", "that", "your",
            "for", "to", "on", "in", "of", "with", "about"
        }
        
        words = prompt.lower().split()
        meaningful_words = []
        
        for word in words:
            clean = word.strip("?.,!;:")
            if clean and clean not in stop_words and (len(clean) > 2 or (len(clean) == 2 and clean.isalpha())):
                meaningful_words.append(clean)
        
        if meaningful_words:
            return " ".join(meaningful_words)
        return "topic"

    def get_available_models(self) -> list[dict]:
        """Return list of available demo models."""
        return [
            {
                "provider": "mock",
                "model": "demo-fast",
                "display_name": "Demo Fast",
                "description": "Quick, concise responses. Perfect for rapid testing.",
                "max_tokens": 1024,
            },
            {
                "provider": "mock",
                "model": "demo-creative",
                "display_name": "Demo Creative",
                "description": "Creative, fun responses with emojis and imagination.",
                "max_tokens": 2048,
            },
            {
                "provider": "mock",
                "model": "demo-detailed",
                "display_name": "Demo Detailed",
                "description": "Comprehensive, detailed responses with thorough explanations.",
                "max_tokens": 4096,
            },
        ]

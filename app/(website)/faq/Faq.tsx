import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
  const faqs = [
    {
      id: "item-1",
      question: "How do I sign up?",
      answer: (
        <div className="space-y-2">
          <p>
            There are several ways to join. You can register as a buyer or a seller. If you wish to sell products, register as a seller. The process is simple:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click on the <strong>Sign Up</strong> tab.</li>
            <li>You&apos;ll be taken to the “Create Your Farm” page. Fill out the online form.</li>
            <li>Set up your seller profile:
              <ul className="list-disc list-inside ml-4">
                <li>Name your farm or business.</li>
                <li>Upload pictures or a short video.</li>
                <li>Describe your garden, farm, or business and the products you want to list.</li>
                <li>Locate yourself on the map.</li>
              </ul>
            </li>
            <li>Press <strong>Continue</strong>.</li>
            <li>You will be taken to the sign-in page. Sign in.</li>
            <li>You&apos;ll now be on your <strong>Dashboard</strong>. From the left menu, click on <strong>My Account</strong>.</li>
            <li>In the upper-right corner, click the <strong>Add Products</strong> tab to start listing your products.</li>
            <li>Use the <strong>Edit</strong> icon to update products, add images, or change pricing at any time.</li>
          </ol>
          <p>
            <strong>Note for buyers:</strong> Signing up is simple — just register and you’re ready to buy in minutes.
          </p>
        </div>
      ),
    },
    {
      id: "item-2",
      question: "Is there a fee to join?",
      answer:
        "No, joining our platform is completely free. You can create an account and start using our basic features at no cost.",
    },
    {
      id: "item-3",
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for premium features.",
    },
    {
      id: "item-4",
      question: "Who can I contact for help?",
      answer:
        "You can reach our support team at support@example.com or use the live chat feature available 24/7 on our website.",
    },
  ];

  return (
    <div className="bg-white my-[80px] md:my-[100px]">
      <div className="max-w-[1296px] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-2xl font-bold text-[#272727] mb-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="bg-white rounded-lg">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border rounded-md border-[#0000001A] bg-[#F9FAFB] mb-3"
              >
                <AccordionTrigger className="px-4 sm:px-6 py-4 sm:py-5 text-left hover:no-underline transition-colors duration-200">
                  <span className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

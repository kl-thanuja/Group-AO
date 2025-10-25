import Image from "next/image";

const ProductShowcase = () => {
  return (
    <section className="w-full">
          <div className="bg-gradient-to-r  rounded-3xl p-8  mx-auto overflow-hidden">
            <Image
              src="/dashboard-screenshot.png" 
              alt="Quoraid Dashboard"
              width={1200}
              height={600}
              className="w-full h-auto rounded-2xl shadow-inner"
              priority
            />
          </div>
    </section>
  );
};


export default ProductShowcase;
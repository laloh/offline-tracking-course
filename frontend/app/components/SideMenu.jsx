export default function SideMenu({ course }) {
  const items = Array.from(Array(40).keys()).map((index) => `Item ${index + 1}`);


  return (
    <div class="flex h-screen flex-col justify-between border-e bg-white">
      <div class="px-4 py-6">
        <ul class="mt-6 space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <a
                href=""
                class="block rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div class="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <a
          href="#"
          class="flex items-center gap-2 bg-white p-4 hover:bg-gray-50"
        >
          <img
            alt="Man"
            src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
            class="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p class="text-xs">
              <strong class="block font-medium">Lalo Carrera</strong>

              <span> lalocarrerahuerta@gmail.com</span>
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}

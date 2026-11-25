# SimpliSleep — Card Asset Generation Prompts (AI Log)
## Set Name: "Simply is Sleeping" (28 Kartu Koleksi)

Dokumen ini mencatat konfigurasi teknis pemanfaatan AI (AI Log) untuk juri SimpliDOTS Vibe Coding Competition 2026. Berisi spesifikasi prompt, fondasi gaya pixel art 16-bit, arahan pose kocak & absurd, pembagian rarity, serta prompt individual lengkap untuk 28 kartu hewan tidur.

---

## 1. Arahan Gaya Khusus: Pose Kocak, Absurd & Menggemaskan

Berdasarkan arahan kreatif terbaru, seluruh kartu hewan tidur wajib memiliki elemen **komedi visual yang absurd namun tetap menggemaskan, sopan, dan bersih** (tanpa kekerasan, cedera fisik, atau toilet humor).

### Ciri Khas Visual Komedi:
- **Pose Ekstrem & Konyol**: Kaki mencuat kaku ke atas (telentang pasrah), kepala nyungsep/terselip, badan setengah merosot dari tempat tidur/bantal, dagu tertekan sampai pipi tumpah.
- **Ekspresi Lebay**: Mulut menganga lebar mendengkur pulas dengan tetesan air liur pixel (*cute pixel drool*), gelembung ingus kartun (*snot bubble*) kembang-kempis, lidah mungil melet menyamping (*blep*).
- **Properti & Aksesori Lucu yang Berantakan**: Topi tidur melorot menutupi mata, masker tidur miring di dahi/leher, bantal kebesaran yang menimpa badan, boneka tidur mini yang dipeluk erat.
- **Efek Tidur Khas Retro**: Huruf 'Zzz' pixel beraneka ukuran melayang secara dramatis.

---

## 2. Shared Core Pixel Art Formula (Varian Bersih & Sederhana)

Setiap prompt kartu mengintegrasikan potongan fondasi gaya teknis yang identik:

```text
Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
Single goofy cute chibi [ANIMAL_SUBJECT] centered in canvas taking up 60-70% of the frame in an absurd and hilarious sleeping pose, [ABSURD_SLEEP_POSE_AND_PROP], exaggerated funny sleeping expression (mouth open snoring with pixel drool or cute cartoon snot bubble).
Minimal clean solid soft pastel [PASTEL_COLOR] background, completely flat solid color, no background scenery, no landscape, no forest, no cave, no room walls, no glowing particles, tiny floating pixel 'Zzz' drifting upward. Authentic retro video game pixel sprite, square 1:1 aspect ratio, no text, no watermark, no blur, no anti-aliasing.
```

---

## 3. Style Prompt Dasar per Rarity (Latar Bersih & Warna Solid Pastel)

### A. Common (12 Kartu) — Latar Solid Pastel Lembut (Krem / Mint / Pink / Lavender)
- **Latar**: Warna polos / pastel lembut (#F3EEFF lavender, soft cream, pastel mint, baby pink) yang bersih agar fokus visual tertuju pada pose tidur absurd hewan.
- **Formula**:
  ```text
  Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
  Single goofy cute chibi [ANIMAL_SUBJECT] centered taking up 60-70% of frame, [ABSURD_SLEEP_POSE], exaggerated cute sleeping face with mouth open snoring and tiny pixel drool or snot bubble, tiny floating pixel 'Zzz'.
  Minimal clean flat solid soft pastel [CREAM/MINT/PINK/LAVENDER] background, no background scenery, no room, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
  ```

### B. Rare (8 Kartu) — Latar Solid Pastel Biru Muda (#D6EAF8) + 1 Properti Lucu
- **Latar & Properti**: Latar solid pastel biru muda bersih (#D6EAF8), maksimal 1 properti kecil yang dipeluk/dipakai (dahan pendek, bantal, kardus mini, topi tidur), tanpa pemandangan/ruangan.
- **Formula**:
  ```text
  Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
  Single goofy cute chibi [ANIMAL_SUBJECT] centered taking up 60-70% of frame, [COMICAL_SLEEP_POSE_AND_1_PROP], exaggerated funny sleeping face with mouth open snoring and pixel drool, tiny floating pixel 'Zzz'.
  Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no trees, no room walls, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
  ```

### C. Epic (5 Kartu) — Latar Solid Pastel Ungu Muda (#E8DAEF) + 1 Properti Khas
- **Latar & Properti**: Latar solid pastel ungu muda lembut (#E8DAEF), subjek tidur dalam pose konyol memeluk 1 properti magis/khas, tanpa gua/laut/hutan penuh detail.
- **Formula**:
  ```text
  Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
  Single goofy cute chibi [ANIMAL_SUBJECT] centered taking up 60-70% of frame, [ABSURD_EPIC_SLEEP_POSE_AND_PROP], comical sleeping face with mouth open snoring and pixel drool, tiny floating pixel 'Zzz'.
  Minimal clean flat solid soft pastel lavender purple background (#E8DAEF), no background scenery, no dark caves, no deep sea, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
  ```

### D. Legendary (3 Kartu) — Latar Solid Pastel Kuning Emas Lembut (#FEF9E7) + Manja
- **Latar & Properti**: Latar solid pastel kuning muda / emas lembut (#FEF9E7), makhluk agung tidur manja konyol (memeluk boneka, kepala melorot di koin, tidur pulas di sarang), tanpa latar gelap pekat atau partikel berlebihan.
- **Formula**:
  ```text
  Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
  Single goofy cute chibi [ANIMAL_SUBJECT] centered taking up 60-70% of frame, [HILARIOUS_LEGENDARY_BABY_POSE], subtle soft golden rim glow around sprite outline, mouth open snoring with tiny pixel drool and smoke/sparks, tiny floating pixel 'Zzz'.
  Minimal clean flat solid soft pastel golden yellow background (#FEF9E7), no background scenery, no dark night, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
  ```

---

## 4. Daftar Prompt Rinci per Kartu (28 Kartu)

### Tier: Common (12 Kartu)

1. **`orange-cat` (Kucing Oren)**
   - **Deskripsi**: Kucing oren gembul meringkuk bulat dengan gelembung ingus raksasa kembang-kempis dan mulut sedikit menganga.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a chubby ginger tabby cat curled into an absurdly tight round ball, mouth slightly open with a tiny drop of pixel drool, a comical large blue cartoon snot bubble expanding from its nose, tiny floating pixel 'Zzz', centered composition, clean dark outline, warm ginger orange and cream palette, minimalist soft pastel lavender background (#F3EEFF), square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

2. **`sloth` (Kungkang Santai)**
   - **Deskripsi**: Kungkang tidur bergelantungan santai di dahan pendek dengan topi tidur melorot menutupi seluruh matanya.
   - **Prompt**:
     ```text
     16-bit retro pixel art sprite of a goofy baby sloth sleeping upside down clinging to a single short horizontal tree branch, an oversized purple striped nightcap fallen down over its head covering its eyes, mouth agape with a tiny pixel drool drop, tiny floating pixel 'Zzz', centered composition, clean dark outline, limited warm brown and purple palette, flat minimal solid soft pastel lavender background (#F3EEFF), absolutely no dark night sky, no moon, no stars, no forest background, square 1:1 aspect ratio, authentic retro pixel art, clean anatomy, no text, no watermark.
     ```

3. **`corgi` (Anjing Corgi)**
   - **Deskripsi**: Corgi telentang pasrah dengan satu kepala jelas di sebelah kiri, empat kaki pendek kaku menghadap langit-langit, mulut menganga lucu mendengkur.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a single fluffy Pembroke Welsh Corgi sleeping flat on its back, one single distinct head on the left with cute pointed ears and sleeping face, mouth open snoring with funny cute expression and tiny pixel drool, white belly facing up, exactly four tiny stubby paws sticking straight up into the air in total surrender, tiny rounded rear with small stubby tail on the right, correct anatomy with only one head and four paws, tiny floating pixel 'Zzz', centered composition, clean dark outline, golden fawn and white fur, minimalist soft pastel cream background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

4. **`hamster` (Hamster Kenyang)**
   - **Deskripsi**: Hamster kepala nyungsep di dalam mangkuk biji bunga matahari, pantat bulat dan kaki kecil mencuat ke atas.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a chubby dwarf hamster that fell asleep face-first inside a ceramic food bowl overflowing with sunflower seeds, round furry butt and tiny pink feet sticking straight up into the air, squished puffy cheeks, tiny floating pixel 'Zzz' rising from the bowl, centered composition, clean dark outline, golden brown fur palette, minimalist pastel yellow background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

5. **`white-rabbit` (Kelinci Putih)**
   - **Deskripsi**: Kelinci putih telungkup gepeng seperti pancake, telinga panjang kusut menutupi muka dengan air liur membentuk genangan mini.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a pure white fluffy bunny rabbit melted flat like a sleepy fluffy pancake on the floor, extra long floppy ears tangled and draped entirely over its face, tiny puddle of pixel drool peeking from beneath its snout, tiny floating pixel 'Zzz', centered composition, clean dark outline, snowy white and soft pink ear tones, minimalist soft pastel lavender background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

6. **`hedgehog` (Landak Mini)**
   - **Deskripsi**: Landak mini telentang di atas daun kering kecil sambil menahan bantal mini kebesaran di atas dahinya.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a tiny African pygmy hedgehog sleeping flat on its back on a crunchy brown autumn leaf, an oversized fluffy checkered mini pillow resting comically over its forehead, soft pink belly exposed with relaxed soft quills, mouth open snoring with tiny floating pixel 'Zzz', centered composition, clean dark outline, earthy brown palette, minimalist soft pastel peach background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

7. **`yellow-duck` (Bebek Kuning)**
   - **Deskripsi**: Bebek kuning berdiri oleng satu kaki nyaris tumbang, kepala nyelip terbalik di bawah sayap dengan gelembung tidur besar.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a chubby yellow duckling precariously fast asleep standing wobbling on a single orange leg, head tucked backwards upside down beneath its wing, a huge comical cartoon snot bubble bobbing from its beak, tiny floating pixel 'Zzz', centered composition, clean dark outline, bright yellow and orange palette, minimalist soft pastel sky blue background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

8. **`capybara` (Kapibara Santuy)**
   - **Deskripsi**: Kapibara duduk kaku dengan mata terpejam pasrah, sebutir jeruk di atas kepala dan satu lagi bertengger di ujung hidung peseknya.
   - **Prompt**:
     ```text
     16-bit retro pixel art of a stoic zen master chibi capybara sitting upright sleeping with an utterly blank expression, one bright orange yuzu fruit balanced on its flat head and another tiny orange balanced on the very tip of its snout, tiny floating pixel 'Zzz', centered composition, clean dark outline, warm earthy brown palette with vivid orange fruit accents, minimalist soft pastel mint green background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

9. **`red-panda` (Panda Merah)**
   - **Deskripsi**: Panda merah tengkurap memeluk ekor belang raksasanya sendiri yang ditarik sampai menutupi seluruh tubuhnya.
   - **Prompt**:
     ```text
     16-bit retro pixel art of an adorable red panda sleeping face-planted on the ground, tightly clutching its absurdly giant fluffy ringed tail wrapped all the way around its body like a heavy duvet, only its black snout and snoozing open mouth showing with tiny pixel drool, tiny floating pixel 'Zzz', centered composition, clean dark outline, russet red-orange palette, minimalist soft pastel beige background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
     ```

10. **`otter` (Berang-berang Apung)**
    - **Deskripsi**: Berang-berang mengapung telentang di air pastel memeluk bantal donat mini, mulut terbuka menganga meneteskan air liur.
    - **Prompt**:
      ```text
      16-bit retro pixel art of a cute river otter floating on its back in calm water, tightly hugging a colorful mini donut swim ring like a teddy bear, mouth wide open snoring with a visible drop of pixel drool, silly relaxed expression, tiny floating pixel 'Zzz', centered composition, clean dark outline, rich warm brown palette with pastel blue water ripples, minimalist soft pastel background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

11. **`mini-pig` (Babi Mini)**
    - **Deskripsi**: Babi mini setengah badannya merosot jatuh dari bantal krem kecil, hidung menempel di lantai mendengkur keras.
    - **Prompt**:
      ```text
      16-bit retro pixel art of a chubby pink teacup piglet with the top half of its body completely slid off a plush cream pillow onto the floor, squished snout flat against the ground, little curly tail twitching, loud comical sleeping face with thick pixel 'Zzz', centered composition, clean dark outline, soft baby pink palette with warm cream pillow, minimalist soft pastel lilac background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

12. **`chick` (Anak Ayam)**
    - **Deskripsi**: Anak ayam terjepit terbalik di dalam cangkang telur setengah pecah, hanya kaki mungilnya yang menendang-nendang di udara.
    - **Prompt**:
      ```text
      16-bit retro pixel art of a tiny fluffy yellow chick wedged upside down inside a cracked half eggshell, tiny orange stick legs dangling helplessly out in the air, a tiny comical cartoon snot bubble rising from inside the shell along with tiny pixel 'Zzz', centered composition, clean dark outline, sunny yellow and eggshell white palette, minimalist soft pastel warm background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

---

### Tier: Rare (8 Kartu) — Latar Solid Pastel Biru Muda (#D6EAF8)

13. **`koala` (Koala Eukaliptus)**
    - **Deskripsi**: Koala memeluk dahan kayu pendek dengan pipi gepeng tertekan, mulut mangap ileran, masker tidur daun melorot di leher.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single goofy cute chibi gray koala centered in canvas taking up 65% of the frame. The koala is in a hilarious comatose sleep hugging a single small short vertical wooden branch stub, chubby cheeks comically squished flat against the wood, mouth wide open snoring with a cute drop of pixel drool dripping down, cute green leaf sleep mask slipped down around its neck.
      Minimal clean solid soft pastel sky blue background (#D6EAF8), flat solid color, no background scenery, no forest, no leaves, no trees, no particles, tiny floating pixel 'Zzz' drifting upward. Authentic retro video game pixel sprite, square 1:1 aspect ratio, no text, no watermark, no blur, no anti-aliasing.
      ```

14. **`panda` (Panda Rebah)**
    - **Deskripsi**: Panda rebahan bersandar merosot pada satu batang bambu pendek, dagu nempel di perut buncit, tunas bambu masih menempel di mulut mangap berliur.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single chubby giant panda centered taking up 65% of the frame, slumped completely sideways against a single short green bamboo stick in deep goofy sleep, double chin squished flat into its round belly, half-eaten green bamboo shoot hanging out of its open snoring mouth with a line of pixel drool, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no bamboo grove, no forest, no extra clutter, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

15. **`penguin` (Pinguin Kutub)**
    - **Deskripsi**: Pinguin berdiri kaku tidur miring dengan topi tidur malam panjang yang ujung pom-pomnya masuk ke dalam paruhnya sendiri.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single plump emperor penguin centered taking up 65% of the frame, fast asleep standing rigidly slightly tilted, wearing an extra-long red-and-white striped nightcap whose fluffy pom-pom has comically dropped directly into its own slightly open snoring beak, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no igloo, no snow mountains, no aurora, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

16. **`polar-bear` (Beruang Kutub)**
    - **Deskripsi**: Bayi beruang kutub bulat tidur telentang di atas satu balok es mini kecil, syal merah melilit kepala seperti serban tidur, mulut menganga meneteskan liur.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single round white baby polar bear cub centered taking up 65% of the frame, sleeping flat on its back on top of a single tiny floating ice block, rear legs comically dangling over the edge, a long cozy red knit scarf wrapped around its head like a clumsy sleep turban, mouth wide open snoring with a cute drop of pixel drool, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no ocean water, no icebergs, no snowflakes, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

17. **`raccoon` (Rakun Manis)**
    - **Deskripsi**: Rakun tidur nyungsep ke dalam satu kotak kardus sempit, pantat bulat dan ekor belang menjuntai keluar, remahan kue di lantai.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single cute bandit raccoon centered taking up 65% of the frame, crammed head-first into a way too small brown cardboard box, its fluffy striped tail and two hind paws sticking out backward in a ridiculous sleeping pose, tiny pie crumbs near the box, loud comical pixel 'Zzz' puffing from inside the box.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no attic walls, no wood floor clutter, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

18. **`squirrel` (Tupai Kacang)**
    - **Deskripsi**: Tupai merah pipi gembul meringkuk memeluk erat satu biji ek (*acorn*) besar di dadanya, ekor berbulu lebat melengkung tinggi, mulut terbuka ileran.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single chubby red squirrel centered taking up 65% of the frame, in a hilarious satisfied sleeping curled pose, tightly hugging a single oversized golden brown acorn against its chest like a teddy bear, ridiculously puffy cheeks, giant fluffy curved tail arching overhead, mouth open snoring with a tiny pixel drool drop, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no tree hollow, no pile of nuts, no leaves, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

19. **`witch-cat` (Kucing Penyihir)**
    - **Deskripsi**: Kucing hitam tidur tengkurap di atas satu buku mantra tebal tertutup, topi penyihir ungu melorot menutup seluruh kepala sampai cuma terlihat ekor dan dengkuran.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single sleek black cat centered taking up 65% of the frame, sprawled dead to the world face-down across a single large ancient purple spellbook, an oversized crooked purple wizard hat slipped down completely over its face and ears, twitching tail curled around the book, tiny floating purple pixel 'Zzz' rising upward.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), no background scenery, no candles, no potion bottles, no shelves, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

20. **`red-fox` (Rubah Merah)**
    - **Deskripsi**: Rubah merah tidur menggulung lucu dengan kepala dan telinga runcing terlihat jelas di sebelah kiri, ekor lebat berujung putih ditarik menyelimuti punggung dan kaki, hidung hitam meneteskan liur / gelembung ingus.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single adorable chibi red fox curled up in a sleeping ball in center of frame taking up 65% of canvas. Clear distinct cute fox head on the left with prominent pointed triangular fox ears, white inner ear fur, cute sleeping face with closed crescent eyes, black nose tip, tiny comical drop of pixel drool or snot bubble. The body is curled around with a giant fluffy orange tail with a white tip draped over its back and paws like a cozy blanket.
      Minimal clean flat solid soft pastel sky blue background (#D6EAF8), completely flat solid color, no background scenery, no grass patch, no forest, no trees, no particles, tiny floating pixel 'Zzz' drifting upward. Authentic retro video game pixel sprite, square 1:1 aspect ratio, no text, no watermark, no blur, no anti-aliasing.
      ```

---

### Tier: Epic (5 Kartu) — Latar Solid Pastel Ungu Muda (#E8DAEF)

21. **`owl` (Burung Hantu Siang)**
    - **Deskripsi**: Burung hantu tidur siang tergantung terbalik di satu dahan kayu pendek kecil, memakai eye mask satin malam hari, paruh mangap ileran.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single quirky brown barn owl centered taking up 65% of the frame, taking a ridiculous nap hanging upside down by just one clumsy talon from a single small horizontal branch stub, wearing a satin night sleep mask over its eyes, head turned backward in deep snoring bliss, tiny drop of pixel drool from beak, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel lavender purple background (#E8DAEF), no background scenery, no forest canopy, no sunbeams, no leaves, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

22. **`blue-whale` (Paus Biru Samudra)**
    - **Deskripsi**: Paus biru meluncur vertikal tidur dengan topi tidur mini di siripnya, meniup satu gelembung napas besar dengan pixel Zzz.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single chubby blue whale centered taking up 65% of the frame, floating vertically tail-down head-up fast asleep, a tiny comical striped nightcap strapped onto its top fin, blowing a single large cute cartoon sleep bubble from its blowhole with tiny pixel 'Zzz' inside, serene snoring expression.
      Minimal clean flat solid soft pastel lavender purple background (#E8DAEF), no background scenery, no dark ocean abyss, no sunbeams, no seabed, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

23. **`bat` (Kelelawar Kristal)**
    - **Deskripsi**: Kelelawar buah lucu tergantung terbalik di satu tonjolan kristal kecil, sayap membungkus badan seperti selimut kepompong, lidah melet kecil (*blep*).
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single cute little brown fruit bat centered taking up 65% of the frame, hanging upside down by its tiny feet from a single small purple amethyst crystal node, its leathery wings tightly wrapped around its chubby body like a sleeping burrito cocoon, tiny pink tongue sticking out sideways in a silly blep, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel lavender purple background (#E8DAEF), no background scenery, no cave walls, no multiple crystals, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

24. **`octopus` (Gurita Harta Karun)**
    - **Deskripsi**: Gurita oranye tidur di dalam satu peti kayu kecil, satu tentakel memeluk cangkir piala emas seperti boneka tidur, gelembung Zzz.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single goofy reddish-orange chibi octopus centered taking up 65% of the frame, fast asleep slumped inside a single small open wooden treasure chest, limp curly tentacles spilling over the edge while one tentacle lovingly cuddles a shiny golden goblet like a teddy bear, mouth blowing cute floating bubble 'Zzz's.
      Minimal clean flat solid soft pastel lavender purple background (#E8DAEF), no background scenery, no deep sea, no seabed coins, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

25. **`white-deer` (Rusa Putih Mistis)**
    - **Deskripsi**: Rusa putih mungil tidur bersila telungkup pasrah, tanduk kecil tersangkut satu sulur bunga mekar, kepala mangap ileran.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single ethereal white stag fawn centered taking up 65% of the frame, sleeping in a hilarious pretzel-legged slump, tiny golden antlers comically tangled with a single cute blooming blue flower vine, mouth wide open snoring with a drop of pixel drool, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel lavender purple background (#E8DAEF), no background scenery, no enchanted forest, no glowing mushrooms, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

---

### Tier: Legendary (3 Kartu) — Latar Solid Pastel Kuning Emas Lembut (#FEF9E7)

26. **`t-rex` (T-Rex Si Manja)**
    - **Deskripsi**: Bayi T-Rex hijau gemuk telentang pasrah, tangan kerdil memeluk boneka dino mini di perut buncit, mulut menganga lebar tidur pulas, aura emas lembut di sekitar outline tubuh.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single chubby green baby T-Rex dinosaur centered taking up 65% of the frame, sleeping completely flat on its back, tiny stubby arms clutching a miniature green plush dino toy against its bulging belly, huge jaw wide open snoring with a cute drop of pixel drool, subtle warm golden rim outline glow around the sprite, tiny floating pixel 'Zzz'.
      Minimal clean flat solid soft pastel golden yellow background (#FEF9E7), no background scenery, no dark night, no ground clutter, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

27. **`dragon` (Naga Emas Kemilau)**
    - **Deskripsi**: Naga merah-emas tidur melingkar di atas tumpukan koin emas kecil, kepala merosot di lantai, asap tipis berbentuk Zzz mengepul dari hidung.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single majestic chibi red-and-gold dragon centered taking up 65% of the frame, sleeping so deeply curled around a small pile of shiny gold coins that its chin has comically slid off onto the ground, jaw slacked open with thin puffs of warm smoke forming pixel 'Zzz' from its nostrils, subtle warm golden rim outline glow around the dragon.
      Minimal clean flat solid soft pastel golden yellow background (#FEF9E7), no background scenery, no cavern walls, no dark background, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

28. **`phoenix` (Burung Phoenix Abadi)**
    - **Deskripsi**: Burung phoenix agung tidur nyungsep di sarang bara hangat kecil seperti ayam kedinginan, paruh mendengkur dengan sedikit percikan api Zzz.
    - **Prompt**:
      ```text
      Chunky 16-bit retro pixel art sprite on a crisp 32x32 to 48x48 pixel grid, large visible square pixels, dark 1-pixel outline (#150D27), limited 12-16 color palette.
      Single legendary baby phoenix bird centered taking up 65% of the frame, face-planted fast asleep into a single small cozy nest of warm glowing charcoal twigs, tail feathers splayed out comically like a sleepy chicken, beak slightly open puffing tiny fire spark pixel 'Zzz's, subtle warm radiant golden-orange rim glow around the phoenix feathers.
      Minimal clean flat solid soft pastel golden yellow background (#FEF9E7), no background scenery, no dark night sky, square 1:1 aspect ratio, authentic retro pixel art, no text, no watermark.
      ```

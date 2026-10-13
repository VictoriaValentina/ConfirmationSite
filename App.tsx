import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Image,
  ImageSourcePropType,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

type PetalConfig = {
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  drift: number;
  rotation: string;
};

const PETAL_COLORS = ["#bd355f", "#d9a9bf", "#f2d8e4", "#9c315c"];

const CFG = {
  noivos: "Victória & Breno",
  data: new Date(2027, 3, 17, 17, 0, 0),
  igreja: {
    nome: "Basilica Nossa Senhora da Penha",
    end: "R. Santo Afonso, 199 - Penha de França, São Paulo - SP, 03632-020",
  },
  buffet: {
    nome: "Buffet Prelude",
    end: "R. Cavadas, 544 - Vila Itapegica, Guarulhos - SP, 07044-000",
  },
  estacionamento: {
    nome: "Estacionamento",
    end: "R. Doná Olga, 375 - Vila Itapegica, Guarulhos - SP, 07044-010",
  },
  traje: "Social completo. Sugerimos evitar marsala, branco e off-white.",
  prazo: "1º de março de 2027",
  whatsappEla: "5511974914102",
  whatsappEle: "5511951459135",
  listaPresentes: "", // Informe aqui o link da lista de presentes.
};

const C = {
  vinho: "#7a1736",
  vinhoEscuro: "#5a0f27",
  azul: "#16265a",
  creme: "#fbf6ee",
  rosa: "#f1d3d6",
  text: "#2b2430",
  branco: "#ffffff",
  rosaClaro: "#fbeceb",
};

function FallingPetals() {
  const petals = useRef<PetalConfig[]>(
    Array.from({ length: 18 }, (_, index) => ({
      x: Math.random() * (width - 20),
      delay: Math.random() * 5000,
      duration: 6500 + Math.random() * 6500,
      size: 7 + Math.random() * 8,
      color: PETAL_COLORS[index % PETAL_COLORS.length],
      drift: (Math.random() - 0.5) * 100,
      rotation: `${360 + Math.random() * 540}deg`,
    })),
  ).current;

  const animations = useRef(petals.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = animations.map((animation, index) => {
      const fall = () => {
        animation.setValue(0);

        Animated.timing(animation, {
          toValue: 1,
          duration: petals[index].duration,
          delay: petals[index].delay,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) fall();
        });
      };

      fall();
      return animation;
    });

    return () => {
      loops.forEach((animation) => animation.stopAnimation());
    };
  }, [animations, petals]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {petals.map((petal, index) => {
        const animation = animations[index];

        return (
          <Animated.View
            key={index}
            style={[
              styles.petal,
              {
                left: petal.x,
                width: petal.size,
                height: petal.size * 0.62,
                backgroundColor: petal.color,
                transform: [
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, height + 80],
                    }),
                  },
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, petal.drift],
                    }),
                  },
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", petal.rotation],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function openUrl(url: string) {
  if (!url) {
    Alert.alert(
      "Link não configurado",
      "Adicione o link nas configurações do convite.",
    );
    return;
  }
  Linking.openURL(url).catch(() =>
    Alert.alert("Não foi possível abrir o link."),
  );
}
function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
function Button({
  title,
  onPress,
  variant = "wine",
}: {
  title: string;
  onPress: () => void;
  variant?: "wine" | "blue" | "outline" | "white";
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.82}
      style={[
        styles.button,
        variant === "blue" && styles.buttonBlue,
        variant === "outline" && styles.buttonOutline,
        variant === "white" && styles.buttonWhite,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "outline" && styles.buttonOutlineText,
          variant === "white" && styles.buttonWhiteText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
function Heading({
  kicker,
  children,
}: {
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.heading}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.sectionTitle}>{children}</Text>
      <Text style={styles.heart}>──── ♥ ────</Text>
    </View>
  );
}
function PlaceCard({
  image,
  tag,
  name,
  address,
  button,
  variant,
  onPress,
}: {
  image: ImageSourcePropType;
  tag: string;
  name: string;
  address: string;
  button: string;
  variant?: "wine" | "blue" | "outline";
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <Image
        source={image}
        style={{ width: 48, height: 80, resizeMode: "contain" }}
      />
      <Text style={styles.tag}>{tag}</Text>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.bodyText}>{address}</Text>
      <Button title={button} onPress={onPress} variant={variant || "wine"} />
    </View>
  );
}
function Accordion({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.accordion, open && styles.accordionOpen]}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.accordionHead}
      >
        <View style={styles.smallIcon}>
          <Text style={styles.smallIconText}>{icon}</Text>
        </View>
        <View style={styles.accordionCopy}>
          <Text style={styles.accordionTitle}>{title}</Text>
          <Text style={styles.accordionSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.plus}>{open ? "−" : "+"}</Text>
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}

function Reveal({
  scrollY,
  children,
  style,
}: {
  scrollY: number;
  children: React.ReactNode;
  style?: any;
}) {
  const [y, setY] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shown || y === null) return;
    // dispara quando o topo do bloco entra nos 90% inferiores da tela
    if (scrollY + height * 0.9 > y) {
      setShown(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [scrollY, y, shown, anim]);

  return (
    <Animated.View
      onLayout={(e) => setY(e.nativeEvent.layout.y)}
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Invitation() {
  const insets = useSafeAreaInsets();
  const [remaining, setRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    passed: false,
  });
  const [nome, setNome] = useState("");
  const [vai, setVai] = useState<"sim" | "nao">("sim");
  const [qtd, setQtd] = useState(1);
  const [acompanhantes, setAcompanhantes] = useState("");
  const [restricao, setRestricao] = useState("");
  const [recado, setRecado] = useState("");
  const [rsvpY, setRsvpY] = useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = CFG.data.getTime() - Date.now();
      if (diff < 0) {
        setRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          passed: true,
        });
        return;
      }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        passed: false,
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const confirmationMessage = useMemo(() => {
    const base =
      vai === "sim"
        ? `Confirmo presença no casamento de Victória e Breno (${qtd} pessoa(s)${acompanhantes.trim() ? ": " + acompanhantes.trim() : ""}).${restricao.trim() ? " Restrição alimentar: " + restricao.trim() + "." : ""}`
        : "Infelizmente não poderei comparecer.";
    return `Olá! Sou ${nome.trim()}. ${base}${recado.trim() ? " Recado: " + recado.trim() : ""}`;
  }, [nome, vai, qtd, acompanhantes, restricao, recado]);

  const sendConfirmation = () => {
    if (!nome.trim()) {
      Alert.alert(
        "Falta seu nome",
        "Preencha seu nome completo para continuar.",
      );
      return;
    }
    
  };

  return (
    <View style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        ref={scrollRef}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        bounces={false}
      >
        <LinearGradient
          colors={["#65244f", "#451b4d", "#291b50", "#3c173d"]}
          locations={[0, 0.38, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 48 },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.heroFrame,
              { top: insets.top + 10, bottom: insets.bottom + 10 },
            ]}
          />
          <FallingPetals />

          <View style={styles.content}>
            <Image
              source={require("./assets/nos-gif.gif")}
              style={styles.couplePhoto}
              resizeMode="cover"
            />
            <Text style={styles.eyebrow}>VAMOS NOS CASAR</Text>
            <Text style={styles.scriptName}>Victória</Text>
            <Text style={styles.ampersand}>&amp;</Text>
            <Text style={styles.scriptName}>Breno</Text>

            <Text style={styles.heroDate}>Sábado, 17 de abril de 2027</Text>
            <Text style={styles.heroTime}>Às 17h</Text>

            <Text style={styles.heroSub}>
              COM A BÊNÇÃO DE DEUS E DE NOSSOS PAIS
            </Text>

            <View style={styles.countdown}>
              {remaining.passed ? (
                <View style={styles.countItem}>
                  <Text style={styles.countNumber}>💍</Text>
                  <Text style={styles.countLabel}>É hoje o nosso dia</Text>
                </View>
              ) : (
                [
                  [remaining.days, "DIAS"],
                  [remaining.hours, "HORAS"],
                  [remaining.minutes, "MIN"],
                  [remaining.seconds, "SEG"],
                ].map(([value, label]) => (
                  <View key={String(label)} style={styles.countItem}>
                    <Text style={styles.countNumber}>{String(value)}</Text>
                    <Text style={styles.countLabel}>{String(label)}</Text>
                  </View>
                ))
              )}
            </View>
            <Button
              title="Confirmar presença"
              onPress={() =>
                scrollRef.current?.scrollTo({ y: rsvpY, animated: true })
              }
              variant="white"
            />
          </View>

          <Text style={[styles.heroFootText, { bottom: insets.bottom + 40 }]}>
            Mais informações
          </Text>

          <Text style={[styles.heroFoot, { bottom: insets.bottom + 22 }]}>
            ⌄
          </Text>
        </LinearGradient>

        <Reveal
          scrollY={scrollY}
          style={[styles.section, { backgroundColor: C.branco }]}
        >
          <Heading kicker="O GRANDE DIA">Programação da celebração</Heading>
          <Reveal scrollY={scrollY} style={styles.timelineRow}>
            <Image
              source={require("./assets/relogio.png")}
              style={styles.relogio}
              resizeMode="cover"
            />
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitle}>Cerimônia religiosa</Text>
              <Text style={styles.bodyText}>
                Na igreja, a cerimonia será realizada às 17h. Pedimos que chegue
                com cerca de 20 minutos de antecedência.
              </Text>
            </View>
          </Reveal>

          <Reveal
            scrollY={scrollY}
            style={[styles.timelineRow, styles.timelineLast]}
          >
            <Image
              source={require("./assets/buffet.png")}
              style={styles.recepcao}
              resizeMode="cover"
            />
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitle}>Recepção</Text>
              <Text style={styles.bodyText}>
                Jantar, música e muita festa no buffet, logo após a cerimônia.
              </Text>
            </View>
          </Reveal>
        </Reveal>

        <Reveal scrollY={scrollY} style={styles.section}>
          <Heading kicker="COMO CHEGAR">Onde vamos celebrar</Heading>
          <PlaceCard
            image={require("./assets/igreja.png")}
            tag="CERIMÔNIA · 17H"
            name={CFG.igreja.nome}
            address={CFG.igreja.end}
            button="Abrir no mapa"
            onPress={() => openUrl(mapsUrl(CFG.igreja.end))}
          />
          <PlaceCard
            image={require("./assets/buffetIcon.png")}  
            tag="RECEPÇÃO"
            name={CFG.buffet.nome}
            address={CFG.buffet.end}
            button="Abrir no mapa"
            variant="blue"
            onPress={() => openUrl(mapsUrl(CFG.buffet.end))}
          />
          <PlaceCard
            image={require("./assets/estacionamento.png")}
            tag="ESTACIONAMENTO DO BUFFET"
            name={CFG.estacionamento.nome}
            address={CFG.estacionamento.end} 
            button="Ver no mapa"
            variant="outline"
            onPress={() => openUrl(mapsUrl(CFG.estacionamento.end))}
          />
        </Reveal>

        <Reveal scrollY={scrollY} style={[styles.section, styles.roseSection]}>
          <Heading kicker="BOM SABER">Informações importantes</Heading>
          <Accordion
            icon="📅"
            title="Data e horário"
            subtitle="Sábado, 17 de abril · 17h"
          >
            <Text style={styles.bodyText}>
              A cerimônia começa às 17h do dia 17 de abril de 2027. Pedimos que
              chegue com cerca de 20 minutos de antecedência para se acomodar. A
              recepção acontece logo após a cerimônia.
            </Text>
          </Accordion>
          <Accordion icon="👔" title="Traje" subtitle="O que vestir">
            <Text style={styles.bodyText}>{CFG.traje}</Text>
          </Accordion>
          <Accordion
            icon="🚗"
            title="Estacionamento"
            subtitle="Disponível no buffet"
          >
            <Text style={styles.bodyText}>
              O buffet conta com estacionamento para os convidados. Consulte o
              endereço na seção “Onde vamos celebrar”.
            </Text>
          </Accordion>
          <Accordion
            icon="✓"
            title="Confirmação"
            subtitle="Avise se vai comparecer"
          >
            <Text style={styles.bodyText}>
              Confirme sua presença até {CFG.prazo} usando o formulário abaixo.
              Assim conseguimos organizar tudo com carinho.
            </Text>
          </Accordion>
          <Accordion icon="💬" title="Dúvidas" subtitle="Fale com os noivos">
            <Text style={styles.bodyText}>
              Qualquer dúvida, chame os noivos pelo WhatsApp.
            </Text>
            <Button
              title="Abrir WhatsApp Noivo"
              onPress={() => openUrl(`https://wa.me/${CFG.whatsappEle}`)}
            />
            <Button
              title="Abrir WhatsApp Noiva"
              onPress={() => openUrl(`https://wa.me/${CFG.whatsappEla}`)}
            />
          </Accordion>
        </Reveal>

        <View
          style={[styles.section, { backgroundColor: C.branco }]}
          onLayout={(event) => setRsvpY(event.nativeEvent.layout.y)}
        >
          <Reveal scrollY={scrollY}>
            <Heading kicker="RSVP">Confirme sua presença</Heading>
            <View style={styles.form}>
              <Text style={styles.label}>SEU NOME COMPLETO</Text>
              <TextInput
                value={nome}
                onChangeText={setNome}
                maxLength={80}
                autoCapitalize="words"
                placeholder="Digite seu nome"
                placeholderTextColor="#9b9094"
                style={styles.input}
              />
              <Text style={styles.label}>VOCÊ PODERÁ COMPARECER?</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  onPress={() => setVai("sim")}
                  style={[
                    styles.choice,
                    vai === "sim" && styles.choiceSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      vai === "sim" && styles.choiceTextSelected,
                    ]}
                  >
                    Sim, estarei lá
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVai("nao")}
                  style={[
                    styles.choice,
                    vai === "nao" && styles.choiceSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      vai === "nao" && styles.choiceTextSelected,
                    ]}
                  >
                    Não poderei
                  </Text>
                </TouchableOpacity>
              </View>
              {vai === "sim" && (
                <>
                  <Text style={styles.label}>
                    QUANTAS PESSOAS (CONTANDO VOCÊ)?
                  </Text>
                  <View style={styles.choiceRow}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => setQtd(n)}
                        style={[
                          styles.numberChoice,
                          qtd === n && styles.choiceSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            qtd === n && styles.choiceTextSelected,
                          ]}
                        >
                          {n}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.label}>NOME DOS ACOMPANHANTES</Text>
                  <TextInput
                    value={acompanhantes}
                    onChangeText={setAcompanhantes}
                    maxLength={200}
                    placeholder="Opcional"
                    placeholderTextColor="#9b9094"
                    style={styles.input}
                  />
                  <Text style={styles.label}>RESTRIÇÃO ALIMENTAR</Text>
                  <TextInput
                    value={restricao}
                    onChangeText={setRestricao}
                    maxLength={120}
                    placeholder="Opcional"
                    placeholderTextColor="#9b9094"
                    style={styles.input}
                  />
                </>
              )}
              <Text style={styles.label}>RECADO PARA OS NOIVOS</Text>
              <TextInput
                value={recado}
                onChangeText={setRecado}
                maxLength={400}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Opcional"
                placeholderTextColor="#9b9094"
                style={[styles.input, styles.textArea]}
              />
              <Button
                title="Enviar confirmação por WhatsApp"
                onPress={sendConfirmation}
              />
              <Text style={styles.helperText}>
                A confirmação será enviada pelo WhatsApp. O formulário ainda não
                salva respostas em um banco de dados.
              </Text>
            </View>
          </Reveal>
        </View>

        <Reveal scrollY={scrollY} style={styles.section}>
          <Heading kicker="COM CARINHO">Lista de presentes</Heading>
          <Text
            style={[styles.bodyText, { textAlign: "center", marginBottom: 22 }]}
          >
            Sua presença é o nosso maior presente. Se quiser nos presentear,
            preparamos uma lista com muito carinho.
          </Text>
          <Button
            title="Ver lista de presentes"
            onPress={() => openUrl(CFG.listaPresentes)}
          />
        </Reveal>

        <Reveal
          scrollY={scrollY}
          style={[styles.footer, { paddingBottom: insets.bottom + 45 }]}
        >
          <Text style={styles.footerNames}>Victória & Breno</Text>
          <Text style={styles.footerDate}>17 · 04 · 2027</Text>
        </Reveal>
      </ScrollView>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: "#65244f",
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Invitation />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fffdfb" },
  scrollContent: { flexGrow: 1, backgroundColor: "transparent" },
  content: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  hero: {
    flexGrow: 1,
    minHeight: height,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroFrame: {
    position: "absolute",
    top: 10,
    bottom: 10,
    left: 14,
    right: 14,
    borderWidth: 1,
    borderColor: "rgba(241,211,214,0.48)",
    borderRadius: 4,
    zIndex: 2,
  },
  eyebrow: {
    color: C.rosa,
    fontSize: 11,
    letterSpacing: 4,
    marginBottom: 18,
    textAlign: "center",
  },
  scriptName: {
    color: C.branco,
    fontSize: 62,
    lineHeight: 72,
    fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "cursive",
    textAlign: "center",
  },
  ampersand: {
    color: C.rosa,
    fontSize: 34,
    fontFamily: "serif",
    marginVertical: -1,
  },
  heroDate: {
    color: C.branco,
    fontSize: 20,
    fontFamily: "serif",
    marginTop: 24,
    textAlign: "center",
  },
  heroTime: { color: C.rosa, fontSize: 17, marginTop: 4 },
  heroSub: {
    color: C.rosa,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 12,
  },
  countdown: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
    marginTop: 28,
    marginBottom: 30,
  },
  countItem: {
    minWidth: 65,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(241,211,214,0.45)",
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  countNumber: {
    color: C.branco,
    fontSize: 25,
    fontFamily: "serif",
    fontWeight: "600",
  },
  countLabel: { color: C.rosa, fontSize: 9, letterSpacing: 1.2, marginTop: 3 },
  button: {
    backgroundColor: C.vinho,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginTop: 10,
  },
  buttonBlue: { backgroundColor: C.azul },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: C.vinho,
  },
  buttonWhite: {
    backgroundColor: C.branco,
    alignSelf: "center",
    paddingHorizontal: 28,
  },
  buttonText: {
    color: C.branco,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.1,
    textAlign: "center",
  },
  buttonOutlineText: { color: C.vinho },
  buttonWhiteText: { color: C.vinho },
  heroFoot: { color: C.rosa, fontSize: 28, position: "absolute", bottom: 22 },
  heroFootText: {
    color: C.rosa,
    fontSize: 12,
    position: "absolute",
    bottom: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 58,
    backgroundColor: C.creme,
  },
  roseSection: { backgroundColor: "#fbeceb" },
  heading: { alignItems: "center", marginBottom: 28 },
  kicker: {
    color: C.vinho,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionTitle: {
    color: C.azul,
    fontSize: 35,
    lineHeight: 41,
    fontFamily: "serif",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  heart: { color: C.vinho, fontSize: 13, marginTop: 14, letterSpacing: 2 },
  timelineRow: {
    flexDirection: "row",
    gap: 17,
    paddingVertical: 22,
    borderTopWidth: 1,
    borderTopColor: C.rosa,
  },
  timelineLast: { borderBottomWidth: 1, borderBottomColor: C.rosa },
  timelineTime: {
    width: 65,
    color: C.vinho,
    fontFamily: "serif",
    fontSize: 25,
    fontWeight: "600",
  },
  timelineCopy: { flex: 1 },
  timelineTitle: {
    color: C.azul,
    fontFamily: "serif",
    fontSize: 23,
    fontWeight: "600",
    marginBottom: 4,
  },
  bodyText: { color: C.text, fontSize: 15, lineHeight: 24 },
  card: {
    backgroundColor: C.branco,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: C.rosa,
    marginBottom: 18,
    shadowColor: C.vinhoEscuro,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.vinho,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  iconText: { color: C.branco, fontSize: 20 },
  tag: {
    color: C.vinho,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 5,
  },
  cardTitle: {
    color: C.azul,
    fontFamily: "serif",
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 8,
  },
  accordion: {
    backgroundColor: C.branco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.rosa,
    borderTopWidth: 3,
    borderTopColor: C.vinho,
    marginBottom: 13,
    overflow: "hidden",
  },
  accordionOpen: { borderColor: C.vinho },
  accordionHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    paddingHorizontal: 15,
  },
  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.vinho,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  smallIconText: { color: C.branco, fontSize: 16 },
  accordionCopy: { flex: 1 },
  accordionTitle: {
    color: C.azul,
    fontFamily: "serif",
    fontSize: 21,
    fontWeight: "600",
  },
  accordionSubtitle: { color: C.text, fontSize: 13, marginTop: 2 },
  plus: { color: C.vinho, fontSize: 27, marginLeft: 8 },
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: C.rosa,
    borderStyle: "dashed",
    padding: 17,
  },
  form: {
    backgroundColor: C.branco,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: C.rosa,
  },
  label: {
    color: C.azul,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "600",
    marginTop: 17,
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#dccdd0",
    borderRadius: 10,
    backgroundColor: "#fffdfb",
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: C.text,
    fontSize: 16,
  },
  textArea: { minHeight: 100 },
  choiceRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dccdd0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceSelected: { borderColor: C.vinho, backgroundColor: C.rosaClaro },
  choiceText: { color: C.text, fontSize: 13, textAlign: "center" },
  choiceTextSelected: { color: C.vinho, fontWeight: "600" },
  numberChoice: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dccdd0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  helperText: {
    color: "#6f6469",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 12,
  },
  footer: {
    backgroundColor: C.azul,
    paddingVertical: 45,
    alignItems: "center",
  },
  footerNames: {
    color: C.branco,
    fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "cursive",
    fontSize: 45,
  },
  footerDate: { color: C.rosa, fontSize: 10, letterSpacing: 3, marginTop: 8 },
  petal: {
    position: "absolute",
    top: -25,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    opacity: 0.9,
  },
  couplePhoto: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  relogio: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  recepcao: {
    width: 90,
    height: 85,
  },
});
